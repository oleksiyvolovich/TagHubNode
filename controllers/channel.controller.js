'use strict';
// app packages
const _ = require('lodash');
const db = require('../database');
const Validator = require('../components/validator');

class ChannelController {
	/** Fetching all user's channels **/
	async fetchAll(req, res) {
		const channels = await db.models.channel.find({ createdBy: req.user.userId });
		const response = channels.map((item) => {
			return _.omit(item._doc, ['__v', 'createdBy']);
		});
		return res.status(200).send({ channels: response });
	}
	/** Creating a new channel **/
	async create(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		const { name, tags } = req.body;
		const created = await new db.models.channel({
			createdBy: req.user._id,
			name,
			tags
		}).save();

		/** Updating relation field **/
		await db.models.user.updateOne(
			{ _id: req.user._id },
			{ $push: { channels: created._id } }
		);

		const channel = _.omit(created._doc, ['__v', 'createdBy']);
		return res.status(200).json({ success: true, channel });
	}
	/** Deleting the channel by ID **/
	async delete(req, res) {
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		const id = req.params.id;

		/** Updating relation field **/
		await db.models.user.findOneAndUpdate(
			{ _id: req.user._id },
			{ $pull: { channels: id } }
		);

		const deleted = await db.models.channel.findByIdAndDelete(id);

		return res.status(200).json({ success: !!deleted._id });
	}
}

module.exports = new ChannelController();