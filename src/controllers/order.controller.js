import { OrderModel } from "../models/order.model.js";
import { asyncHandler, ApiResponce } from "../utils/index.js";
import { NotFoundException, BadRequestException } from "../errors/index.js";
import { PAYMENT_METHODS } from "../constants/index.js";
import { isValidObjectId } from "mongoose";

// ╔════════════════════════════════╗
// ║      Create New Order          ║
// ╚════════════════════════════════╝
export const createOrder = asyncHandler(async (req, res) => {
  const { customerId, order, whitneyBlockId, paymentMethod } = req.body;

  // Validate required fields
  if (!customerId || !order || !whitneyBlockId || !paymentMethod) {
    throw new BadRequestException(
      "Customer ID, order details, Whitney block ID, and payment method are required."
    );
  }

  // Validate customer ID
  if (!isValidObjectId(customerId)) {
    throw new BadRequestException("Customer ID is not a valid MongoDB ID.");
  }

  // Validate Whitney block ID
  if (!isValidObjectId(whitneyBlockId)) {
    throw new BadRequestException(
      "Whitney block ID is not a valid MongoDB ID."
    );
  }

  // Validate payment method
  if (!Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    throw new BadRequestException("Invalid payment method.");
  }

  // Validate order structure
  if (!Array.isArray(order) || order.length === 0) {
    throw new BadRequestException("Order must be a non-empty array.");
  }

  // Validate each sub-order
  for (const subOrder of order) {
    if (!subOrder.sellerId || !isValidObjectId(subOrder.sellerId)) {
      throw new BadRequestException("Invalid seller ID in order.");
    }

    if (
      !subOrder.categories ||
      !Array.isArray(subOrder.categories) ||
      subOrder.categories.length === 0
    ) {
      throw new BadRequestException(
        "Categories are required for each sub-order."
      );
    }

    if (
      !subOrder.products ||
      !Array.isArray(subOrder.products) ||
      subOrder.products.length === 0
    ) {
      throw new BadRequestException(
        "Products are required for each sub-order."
      );
    }

    // Validate each product in sub-order
    for (const product of subOrder.products) {
      if (!product.productId || !isValidObjectId(product.productId)) {
        throw new BadRequestException("Invalid product ID in order.");
      }

      if (!product.qty || product.qty < 1) {
        throw new BadRequestException("Product quantity must be at least 1.");
      }

      if (!product.sellerPrice || product.sellerPrice < 0) {
        throw new BadRequestException(
          "Seller price must be a positive number."
        );
      }

      if (product.profitMargin < 0) {
        throw new BadRequestException("Profit margin cannot be negative.");
      }
    }

    if (!subOrder.subTotal || subOrder.subTotal < 0) {
      throw new BadRequestException("Subtotal must be a positive number.");
    }

    if (!subOrder.shippingCost || subOrder.shippingCost < 0) {
      throw new BadRequestException("Shipping cost must be a positive number.");
    }

    if (!subOrder.total || subOrder.total < 0) {
      throw new BadRequestException("Total must be a positive number.");
    }
  }

  const newOrder = await OrderModel.create({
    customerId,
    order,
    whitneyBlockId,
    paymentMethod,
  });

  return res.status(201).json(
    new ApiResponce({
      statusCode: 201,
      message: "Order created successfully.",
      data: newOrder,
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get All Orders            ║
// ╚════════════════════════════════╝
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    customerId,
    sellerId,
    paymentMethod,
  } = req.query;

  const query = {};

  // Add filters if provided
  if (customerId && isValidObjectId(customerId)) {
    query.customerId = customerId;
  }

  if (sellerId && isValidObjectId(sellerId)) {
    query["order.sellerId"] = sellerId;
  }

  if (paymentMethod && Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    query.paymentMethod = paymentMethod;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await OrderModel.find(query)
    .populate("customerId", "firstName lastName email phone")
    .populate("order.sellerId", "firstName lastName email phone")
    .populate("order.products.productId", "name price description")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalOrders = await OrderModel.countDocuments(query);

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        orders.length > 0 ? "Orders fetched successfully." : "No orders found.",
      data: {
        orders: orders.length > 0 ? orders : [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalOrders,
          hasNextPage: skip + orders.length < totalOrders,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get Order By ID           ║
// ╚════════════════════════════════╝
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new BadRequestException("Order ID is not a valid MongoDB ID.");
  }

  const order = await OrderModel.findById(id)
    .populate("customerId", "firstName lastName email phone")
    .populate("order.sellerId", "firstName lastName email phone")
    .populate("order.products.productId", "name price description images")
    .populate("whitneyBlockId", "name address");

  if (!order) {
    throw new NotFoundException("Order not found.");
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Order fetched successfully.",
      data: order,
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get Order By Custom ID    ║
// ╚════════════════════════════════╝
export const getOrderByCustomId = asyncHandler(async (req, res) => {
  const { orderCustomId } = req.params;

  if (!orderCustomId || isNaN(orderCustomId)) {
    throw new BadRequestException("Order custom ID must be a valid number.");
  }

  const order = await OrderModel.findOne({
    orderCustomId: parseInt(orderCustomId),
  })
    .populate("customerId", "firstName lastName email phone")
    .populate("order.sellerId", "firstName lastName email phone")
    .populate("order.products.productId", "name price description images")
    .populate("whitneyBlockId", "name address");

  if (!order) {
    throw new NotFoundException("Order not found.");
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Order fetched successfully.",
      data: order,
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get Orders By Customer    ║
// ╚════════════════════════════════╝
export const getOrdersByCustomer = asyncHandler(async (req, res) => {
  const { customerId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(customerId)) {
    throw new BadRequestException("Customer ID is not a valid MongoDB ID.");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await OrderModel.find({ customerId })
    .populate("order.sellerId", "firstName lastName email phone")
    .populate("order.products.productId", "name price description images")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalOrders = await OrderModel.countDocuments({ customerId });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        orders.length > 0
          ? "Customer orders fetched successfully."
          : "No orders found for this customer.",
      data: {
        orders: orders.length > 0 ? orders : [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalOrders,
          hasNextPage: skip + orders.length < totalOrders,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get Orders By Seller      ║
// ╚════════════════════════════════╝
export const getOrdersBySeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!isValidObjectId(sellerId)) {
    throw new BadRequestException("Seller ID is not a valid MongoDB ID.");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const orders = await OrderModel.find({ "order.sellerId": sellerId })
    .populate("customerId", "firstName lastName email phone")
    .populate("order.products.productId", "name price description images")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalOrders = await OrderModel.countDocuments({
    "order.sellerId": sellerId,
  });

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message:
        orders.length > 0
          ? "Seller orders fetched successfully."
          : "No orders found for this seller.",
      data: {
        orders: orders.length > 0 ? orders : [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalOrders / parseInt(limit)),
          totalOrders,
          hasNextPage: skip + orders.length < totalOrders,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    })
  );
});

// ╔════════════════════════════════╗
// ║      Update Order              ║
// ╚════════════════════════════════╝
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { order, paymentMethod } = req.body;

  if (!isValidObjectId(id)) {
    throw new BadRequestException("Order ID is not a valid MongoDB ID.");
  }

  const existingOrder = await OrderModel.findById(id);
  if (!existingOrder) {
    throw new NotFoundException("Order not found.");
  }

  // Validate payment method if provided
  if (
    paymentMethod &&
    !Object.values(PAYMENT_METHODS).includes(paymentMethod)
  ) {
    throw new BadRequestException("Invalid payment method.");
  }

  // Validate order structure if provided
  if (order) {
    if (!Array.isArray(order) || order.length === 0) {
      throw new BadRequestException("Order must be a non-empty array.");
    }

    // Validate each sub-order
    for (const subOrder of order) {
      if (!subOrder.sellerId || !isValidObjectId(subOrder.sellerId)) {
        throw new BadRequestException("Invalid seller ID in order.");
      }

      if (
        !subOrder.categories ||
        !Array.isArray(subOrder.categories) ||
        subOrder.categories.length === 0
      ) {
        throw new BadRequestException(
          "Categories are required for each sub-order."
        );
      }

      if (
        !subOrder.products ||
        !Array.isArray(subOrder.products) ||
        subOrder.products.length === 0
      ) {
        throw new BadRequestException(
          "Products are required for each sub-order."
        );
      }

      // Validate each product in sub-order
      for (const product of subOrder.products) {
        if (!product.productId || !isValidObjectId(product.productId)) {
          throw new BadRequestException("Invalid product ID in order.");
        }

        if (!product.qty || product.qty < 1) {
          throw new BadRequestException("Product quantity must be at least 1.");
        }

        if (!product.sellerPrice || product.sellerPrice < 0) {
          throw new BadRequestException(
            "Seller price must be a positive number."
          );
        }

        if (product.profitMargin < 0) {
          throw new BadRequestException("Profit margin cannot be negative.");
        }
      }

      if (!subOrder.subTotal || subOrder.subTotal < 0) {
        throw new BadRequestException("Subtotal must be a positive number.");
      }

      if (!subOrder.shippingCost || subOrder.shippingCost < 0) {
        throw new BadRequestException(
          "Shipping cost must be a positive number."
        );
      }

      if (!subOrder.total || subOrder.total < 0) {
        throw new BadRequestException("Total must be a positive number.");
      }
    }

    existingOrder.order = order;
  }

  if (paymentMethod) {
    existingOrder.paymentMethod = paymentMethod;
  }

  await existingOrder.save();

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Order updated successfully.",
      data: existingOrder,
    })
  );
});

// ╔════════════════════════════════╗
// ║      Delete Order              ║
// ╚════════════════════════════════╝
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new BadRequestException("Order ID is not a valid MongoDB ID.");
  }

  const order = await OrderModel.findByIdAndDelete(id);
  if (!order) {
    throw new NotFoundException("Order not found.");
  }

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Order deleted successfully.",
    })
  );
});

// ╔════════════════════════════════╗
// ║      Get Order Statistics      ║
// ╚════════════════════════════════╝
export const getOrderStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate, customerId, sellerId } = req.query;

  const query = {};

  // Add date range filter if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) {
      query.date.$gte = new Date(startDate);
    }
    if (endDate) {
      query.date.$lte = new Date(endDate);
    }
  }

  // Add customer filter if provided
  if (customerId && isValidObjectId(customerId)) {
    query.customerId = customerId;
  }

  // Add seller filter if provided
  if (sellerId && isValidObjectId(sellerId)) {
    query["order.sellerId"] = sellerId;
  }

  const [totalOrders, totalRevenue, ordersByPaymentMethod] = await Promise.all([
    OrderModel.countDocuments(query),
    OrderModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $reduce: {
                input: "$order",
                initialValue: 0,
                in: { $add: ["$$value", "$$this.total"] },
              },
            },
          },
        },
      },
    ]),
    OrderModel.aggregate([
      { $match: query },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    ]),
  ]);

  const statistics = {
    totalOrders,
    totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
    ordersByPaymentMethod: ordersByPaymentMethod.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };

  return res.status(200).json(
    new ApiResponce({
      statusCode: 200,
      message: "Order statistics fetched successfully.",
      data: statistics,
    })
  );
});
