import bcrypt from "bcrypt";
import { User } from "../models/UserModel.js";

// ambil semua wasit
export const getWasit = async (req, res) => {
  const data = await User.findAll({
    where: { role: "wasit" },
    attributes: ["id", "name", "email", "status", "createdAt"]
  });
  res.json(data);
};

// tambah wasit (admin)
export const createWasit = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hash,
    role: "wasit",
    status: "verified" // langsung aktif
  });

  res.status(201).json(user);
};

// update status wasit
export const updateStatusWasit = async (req, res) => {
  const { status } = req.body;
  await User.update({ status }, { where: { id: req.params.id } });
  res.json({ message: "Status updated" });
};

// hapus wasit
export const deleteWasit = async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: "Wasit deleted" });
};


export const updateWasit = async (req, res) => {
  const { name, email, password } = req.body;

  const data = { name, email };

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    data.password = hash;
  }

  await User.update(data, { where: { id: req.params.id } });

  res.json({ message: "Wasit updated" });
};

