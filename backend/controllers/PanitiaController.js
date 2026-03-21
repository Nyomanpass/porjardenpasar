import bcrypt from "bcrypt";
import { User } from "../models/UserModel.js";

// ambil semua panitia
export const getPanitia = async (req, res) => {
  const data = await User.findAll({
    where: { role: "panitia" },
    attributes: ["id", "name", "email", "status", "createdAt"]
  });
  res.json(data);
};

// tambah panitia
export const createPanitia = async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hash,
    role: "panitia",
    status: "verified"
  });

  res.status(201).json(user);
};

// update panitia
export const updatePanitia = async (req, res) => {
  const { name, email, password } = req.body;

  const data = { name, email };

  if (password) {
    const hash = await bcrypt.hash(password, 10);
    data.password = hash;
  }

  await User.update(data, { where: { id: req.params.id } });

  res.json({ message: "Panitia updated" });
};

// update status panitia
export const updateStatusPanitia = async (req, res) => {
  const { status } = req.body;
  await User.update({ status }, { where: { id: req.params.id } });
  res.json({ message: "Status updated" });
};

// delete panitia
export const deletePanitia = async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.json({ message: "Panitia deleted" });
};