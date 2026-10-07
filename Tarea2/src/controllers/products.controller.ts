import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../conf/dbConnection.js";

export class ProductsController {
  public async getAll(_req: Request, res: Response) {
    try {
      const [products] = await pool.execute(
        "SELECT id, name, price, stock, description, brand, img, active FROM products WHERE active = TRUE"
      );
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ message: "Invalid ID. Must be a positive integer." });
        return;
      }

      const [products] = await pool.execute<RowDataPacket[]>(
        "SELECT id, name, price, stock, description, brand, img, active FROM products WHERE id = ? AND active = TRUE",
        [id]
      );

      if (!products[0]) {
        res.status(404).json({ message: "Product not found or inactive" });
        return;
      }
      res.json(products[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const { name, price, stock, description, brand, img } = req.body;

      if (!name || price === undefined || stock === undefined || !description) {
        res.status(400).json({ message: "Missing required fields: name, price, stock, description" });
        return;
      }

      if (typeof price !== "number" || price <= 0) {
        res.status(400).json({ message: "Price must be a number greater than zero" });
        return;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO products (name, price, stock, description, brand, img) VALUES (?, ?, ?, ?, ?, ?)",
        [name, price, stock, description, brand || null, img || null]
      );

      res.status(201).json({
        message: "Product created successfully",
        productId: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ message: "Invalid ID" });
        return;
      }

      const { name, price, stock, description, brand, img } = req.body;

      if (!name || price === undefined || stock === undefined || !description) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      if (typeof price !== "number" || price <= 0) {
        res.status(400).json({ message: "Price must be a number greater than zero" });
        return;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE products SET name = ?, price = ?, stock = ?, description = ?, brand = ?, img = ? WHERE id = ? AND active = TRUE",
        [name, price, stock, description, brand || null, img || null, id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "Product not found or inactive" });
        return;
      }

      res.json({ message: "Product updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public async deleteLogic(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ message: "Invalid ID" });
        return;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE products SET active = FALSE WHERE id = ? AND active = TRUE",
        [id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "Product not found or already inactive" });
        return;
      }

      res.json({ message: "Product deleted logically" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public async changePrice(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id) || id <= 0) {
        res.status(400).json({ message: "Invalid ID" });
        return;
      }

      const { price } = req.body;

      if (typeof price !== "number" || price <= 0) {
        res.status(400).json({ message: "Price must be a number greater than zero" });
        return;
      }

      const [result] = await pool.execute<ResultSetHeader>(
        "UPDATE products SET price = ? WHERE id = ? AND active = TRUE",
        [price, id]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({ message: "Product not found or inactive" });
        return;
      }

      res.json({ message: "Product price updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
