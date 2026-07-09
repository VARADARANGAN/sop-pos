const mongoose = require("mongoose");
const Order = require("../models/Order");
const Inventory = require("../models/Inventory");
const Product = require("../models/Product");
const { logAction } = require("../utils/auditLogger");

class BillingService {
  /**
   * Helper: Generate unique order number
   */
  async generateOrderNumber() {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${timestamp}-${random}`;
  }

  /**
   * Helper: Process stock deduction (atomic)
   */
  async deductStock(branchId, items, session) {
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, isDeleted: false }).session(session);
      if (!product) {
        throw new Error(`Product not found: ${item.name}`);
      }

      if (product.isCombo) {
        // Deduct combo components
        for (const comboComp of product.comboItems) {
          const compProduct = await Product.findOne({ _id: comboComp.productId, isDeleted: false }).session(session);
          if (!compProduct) {
            throw new Error(`Combo component product not found for ${product.productName}`);
          }

          const compQtyToDeduct = comboComp.quantity * item.quantity;

          const inventory = await Inventory.findOne({
            branchId,
            productId: comboComp.productId,
            variantId: comboComp.variantId || null,
            isDeleted: false,
          }).session(session);

          if (!inventory || inventory.currentStock < compQtyToDeduct) {
            throw new Error(`Out of Stock: Component ${compProduct.productName} for Combo ${product.productName} is unavailable`);
          }

          inventory.currentStock -= compQtyToDeduct;
          inventory.availableStock = inventory.currentStock - inventory.reservedStock;
          inventory.lastStockUpdated = new Date();
          await inventory.save({ session });
        }
      } else {
        // Deduct regular product or variant
        const inventory = await Inventory.findOne({
          branchId,
          productId: item.productId,
          variantId: item.variantId || null,
          isDeleted: false,
        }).session(session);

        if (!inventory || inventory.currentStock < item.quantity) {
          throw new Error(`Out of Stock: Product ${item.name} is unavailable`);
        }

        inventory.currentStock -= item.quantity;
        inventory.availableStock = inventory.currentStock - inventory.reservedStock;
        inventory.lastStockUpdated = new Date();
        await inventory.save({ session });
      }
    }
  }

  /**
   * Checkout Order (Completed immediately)
   */
  async checkoutOrder(orderData, user) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const branchId = user.role === "SUPER_ADMIN" ? orderData.branchId : user.branchId;
      orderData.branchId = branchId;
      orderData.cashierId = user.id;
      orderData.orderNumber = await this.generateOrderNumber();
      orderData.status = "COMPLETED";

      // 1. Verify payments match grandTotal
      const totalPaid = orderData.payments.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPaid - orderData.grandTotal) > 0.01) {
        throw new Error(`Payment mismatch: Total paid is ${totalPaid}, but grand total is ${orderData.grandTotal}`);
      }

      // 2. Perform Stock Deductions
      await this.deductStock(branchId, orderData.items, session);

      // 3. Save Order
      const orders = await Order.create([orderData], { session });
      const order = orders[0];

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Audit Log: checkout
      await logAction({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        action: "ORDER_CHECKOUT",
        entity: "Order",
        entityId: order._id,
        metadata: { grandTotal: order.grandTotal, branchId },
      });

      // Audit Log: Discount Override if discount exists
      const hasDiscount = order.discount > 0 || order.items.some(item => item.discount > 0);
      if (hasDiscount) {
        await logAction({
          actorId: user.id,
          actorName: `${user.firstName} ${user.lastName}`,
          action: "DISCOUNT_OVERRIDE",
          entity: "Order",
          entityId: order._id,
          metadata: {
            orderDiscount: order.discount,
            grandTotal: order.grandTotal,
            role: user.role
          },
        });
      }

      return order;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Hold Order (Save cart server-side)
   */
  async holdOrder(orderData, user) {
    const branchId = user.role === "SUPER_ADMIN" ? orderData.branchId : user.branchId;
    orderData.branchId = branchId;
    orderData.cashierId = user.id;
    orderData.status = "HELD";
    orderData.orderNumber = await this.generateOrderNumber();

    if (!orderData.holdReference) {
      throw new Error("Hold reference code is required to park an order");
    }

    // Check duplicate hold reference in same branch
    const duplicate = await Order.findOne({
      branchId,
      holdReference: orderData.holdReference,
      status: "HELD",
      isDeleted: false,
    });

    if (duplicate) {
      throw new Error(`An order is already parked under reference "${orderData.holdReference}"`);
    }

    const order = await Order.create(orderData);

    await logAction({
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      action: "ORDER_HOLD",
      entity: "Order",
      entityId: order._id,
      metadata: { holdReference: order.holdReference, branchId },
    });

    return order;
  }

  /**
   * Get Parked Orders
   */
  async getHeldOrders(user) {
    const branchId = user.branchId;
    if (!branchId && user.role !== "SUPER_ADMIN") {
      return [];
    }
    const query = { status: "HELD", isDeleted: false };
    if (user.role !== "SUPER_ADMIN") {
      query.branchId = branchId;
    }
    return await Order.find(query)
      .populate("branchId", "branchName")
      .populate("customerId", "name phone");
  }

  /**
   * Resume and Checkout HELD order
   */
  async checkoutHeldOrder(orderId, checkoutData, user) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findOne({ _id: orderId, status: "HELD", isDeleted: false }).session(session);
      if (!order) {
        throw new Error("Held order not found or already checked out");
      }

      // Check branch permissions
      if (user.role !== "SUPER_ADMIN" && order.branchId.toString() !== user.branchId.toString()) {
        throw new Error("Access denied: Held order belongs to another branch");
      }

      // Update fields
      order.items = checkoutData.items || order.items;
      order.subtotal = checkoutData.subtotal || order.subtotal;
      order.tax = checkoutData.tax || order.tax;
      order.discount = checkoutData.discount || order.discount;
      order.grandTotal = checkoutData.grandTotal || order.grandTotal;
      order.payments = checkoutData.payments;
      order.customerId = checkoutData.customerId || order.customerId;
      order.status = "COMPLETED";
      order.holdReference = null; // clear reference

      // Verify payments match grandTotal
      const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(totalPaid - order.grandTotal) > 0.01) {
        throw new Error(`Payment mismatch: Total paid is ${totalPaid}, but grand total is ${order.grandTotal}`);
      }

      // Perform stock deductions
      await this.deductStock(order.branchId, order.items, session);

      await order.save({ session });

      await session.commitTransaction();
      session.endSession();

      // Audit Log: checkout
      await logAction({
        actorId: user.id,
        actorName: `${user.firstName} ${user.lastName}`,
        action: "ORDER_CHECKOUT_HELD",
        entity: "Order",
        entityId: order._id,
      });

      const hasDiscount = order.discount > 0 || order.items.some(item => item.discount > 0);
      if (hasDiscount) {
        await logAction({
          actorId: user.id,
          actorName: `${user.firstName} ${user.lastName}`,
          action: "DISCOUNT_OVERRIDE",
          entity: "Order",
          entityId: order._id,
          metadata: {
            orderDiscount: order.discount,
            grandTotal: order.grandTotal,
            role: user.role
          },
        });
      }

      return order;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Split a Held Order into multiple checkouts
   */
  async splitHeldOrder(orderId, bills, user) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const parentOrder = await Order.findOne({ _id: orderId, status: "HELD", isDeleted: false }).session(session);
      if (!parentOrder) {
        throw new Error("Held order not found or already checked out");
      }

      // Check branch permissions
      if (user.role !== "SUPER_ADMIN" && parentOrder.branchId.toString() !== user.branchId.toString()) {
        throw new Error("Access denied: Held order belongs to another branch");
      }

      const createdOrders = [];

      for (const bill of bills) {
        const billOrderData = {
          orderNumber: await this.generateOrderNumber(),
          branchId: parentOrder.branchId,
          cashierId: user.id,
          customerId: bill.customerId || parentOrder.customerId,
          items: bill.items,
          subtotal: bill.subtotal,
          tax: bill.tax,
          discount: bill.discount,
          grandTotal: bill.grandTotal,
          status: "COMPLETED",
          payments: bill.payments,
        };

        // 1. Verify payments
        const totalPaid = billOrderData.payments.reduce((sum, p) => sum + p.amount, 0);
        if (Math.abs(totalPaid - billOrderData.grandTotal) > 0.01) {
          throw new Error(`Payment mismatch on split bill: Paid ${totalPaid}, required ${billOrderData.grandTotal}`);
        }

        // 2. Stock deductions
        await this.deductStock(parentOrder.branchId, billOrderData.items, session);

        // 3. Create completed order
        const created = await Order.create([billOrderData], { session });
        createdOrders.push(created[0]);

        // Audit Log: checkout
        await logAction({
          actorId: user.id,
          actorName: `${user.firstName} ${user.lastName}`,
          action: "ORDER_CHECKOUT_SPLIT",
          entity: "Order",
          entityId: created[0]._id,
          metadata: { parentOrderId: parentOrder._id },
        });
      }

      // Update or delete the original HELD order
      // For simplicity, we mark it as VOIDED or COMPLETED with 0 items since it was fully split,
      // or we just delete it from active tray. Let's delete (soft-delete) it.
      parentOrder.status = "VOIDED";
      parentOrder.isDeleted = true;
      await parentOrder.save({ session });

      await session.commitTransaction();
      session.endSession();

      return createdOrders;

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Void a complete bill (Cancel it)
   */
  async voidOrder(orderId, user) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) {
      throw new Error("Order not found");
    }

    if (user.role !== "SUPER_ADMIN" && order.branchId.toString() !== user.branchId.toString()) {
      throw new Error("Access denied: Order belongs to another branch");
    }

    order.status = "VOIDED";
    await order.save();

    await logAction({
      actorId: user.id,
      actorName: `${user.firstName} ${user.lastName}`,
      action: "ORDER_VOID",
      entity: "Order",
      entityId: order._id,
    });

    return order;
  }
}

module.exports = new BillingService();
