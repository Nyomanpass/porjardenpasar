import { ScoreRule } from "../models/ScoreRuleModel.js";

export const getScoreRules = async (req, res) => {
  const data = await ScoreRule.findAll();
  res.json(data);
};

export const createScoreRule = async (req, res) => {
  const rule = await ScoreRule.create(req.body);
  res.json(rule);
};

export const updateScoreRule = async (req, res) => {
  const { id } = req.params;
  await ScoreRule.update(req.body, { where: { id } });
  res.json({ msg: "Rule updated" });
};

export const deleteScoreRule = async (req, res) => {
  const { id } = req.params;
  await ScoreRule.destroy({ where: { id } });
  res.json({ msg: "Rule deleted" });
};

export const getScoreRuleById = async (req, res) => {
  const { id } = req.params;

  const rule = await ScoreRule.findByPk(id);

  if (!rule) {
    return res.status(404).json({ msg: "ScoreRule tidak ditemukan" });
  }

  res.json(rule);
};

