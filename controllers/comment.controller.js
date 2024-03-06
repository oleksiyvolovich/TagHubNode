'use strict';

// app packages
const db = require('../database');
const Validator = require('../components/validator');
const _ = require('lodash');

class CommentController {
	async fetchAll(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}
		/** Fetching post ID from params **/
		const id = req.params.id;

		const comments = await db.models.postComments
			.find({ postId: id })
			.select('-__v');

		return res.status(200).json({ comments: comments || [] });
	}

	async create(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		const { id } = req.params;
		const { files, text } = req.body;

		const created = await db.models.postComments.create({
			postId: id,
			text,
			files: files || [],
			postedAt: Date.now(),
			createdBy: req.user._id
		});

		/** Updating relation field **/
		await db.models.post.updateOne(
			{ _id: id },
			{ $push: { comments: created._id } }
		);

		return res.status(200)
			.json({ success: true, comment: _.omit(created._doc, ['__v']) });
	}

	async update(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		const { id, commentId } = req.params;
		const { files, text } = req.body;

		/** Updating data **/
		const updated = await db.models.postComments.findOneAndUpdate(
			{ _id: commentId, postId: id },
			{ text, files },
			{ new: true }
		);

		return res.status(200)
			.json({ success: true, comment: updated._doc });
	}

	/** Deleting comment by ID **/
	async delete(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}
		/** Fetching post ID from params **/
		const { id, commentId } = req.params;

		/** Updating relation field **/
		await db.models.post.findOneAndUpdate(
			{ _id: commentId, postId: id },
			{ $pull: { comments: commentId } }
		);

		/** Deleting comment by ID and sending the response **/
		const deleted = await db.models.postComments.findOneAndDelete({ _id: commentId, postId: id });
		return res.status(200).json({ success: !!deleted._id });
	}
}

module.exports = new CommentController();