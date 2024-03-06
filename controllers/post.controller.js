'use strict';
// app packages
const _ = require('lodash');
const db = require('../database');
const apn = require('../components/apn');
const Validator = require('../components/validator');

class PostController {
	/** Fetching all posts by tags **/
	async fetchAll(req, res) {
		const tags = _.split(req.query.tags, ',');
		if (!tags || !tags.length) {
			return res.status(400).send('Tags is required');
		}

		const posts = await db.models.post
			.find({ tags: { $regex: new RegExp(tags.join('|'), 'i') } })
			.select('-_id -__v');

		return res.status(200).json({ success: true, posts });
	}
	/** Creating a new post **/
	async create(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		/** Creating a new post **/
		const data = {
			text: req.body.text.trim(),
			tags: req.body.tags,
			files: req.body.files || [],
			postedAt: Date.now(),
			createdBy: req.user._id,
			location: req.body.location || {}
		};
		const created = await new db.models.post(data).save();

		/** Updating relation field **/
		await db.models.user.updateOne(
			{ _id: req.user._id },
			{ $push: { createdPosts: created._id } }
		);

		/** Preparing data to send push notifications **/
		const channels = await db.models.channel.find({
			tags: { $in: created.tags }
		}).populate('createdBy').select('-__v');
		const devices = _.uniqBy(channels.map((item) => {
			return item.createdBy.device;
		}), 'id');
		/** Sending push notifications **/
		const promises = devices.map((device) => apn.sendPush(data, device));
		await Promise.allSettled(promises);

		/** Preparing and sending the response **/
		const post = _.omit(created._doc, ['__v']);
		return res.status(200).json({ success: true, post });
	}

	/** Updating post by ID **/
	async update(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}

		/** Fetching post ID from params **/
		const id = req.params.id;

		/** Preparing data to update **/
		const data = new db.models.post({
			text: req.body.text.trim(),
			tags: req.body.tags
			// files: req.body.files || [] // TODO
			// location: req.body.location || {} // TODO
		});

		/** Updating data **/
		const updated = await db.models.post.findOneAndUpdate(
			{ _id: id },
			{ text: data.text, tags: data.tags },
			{ new: true }
		);

		return res.status(200).json({ success: true, post: updated._doc });
	}

	/** Deleting post by ID **/
	async delete(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}
		/** Fetching post ID from params **/
		const id = req.params.id;

		/** Updating relation field **/
		await db.models.user.findOneAndUpdate(
			{ _id: req.user._id },
			{ $pull: { createdPosts: id } }
		);

		/** Deleting post by ID and sending the response **/
		const deleted = await db.models.post.findOneAndDelete({ _id: id });
		return res.status(200).json({ success: !!deleted._id });
	}

	/** Fetching all saved posts **/
	async fetchAllSaved(req, res) {
		const { savedPosts } = await db.models.user.findOne({ _id: req.user._id }).select('savedPosts');
		return res.status(200).json({ posts: savedPosts });
	}

	/** Adding post to saved **/
	async save(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}
		/** Fetching post ID from params **/
		const id = req.params.id;

		await db.models.user.updateOne(
			{ _id: req.user._id },
			{ $push: { savedPosts: id } }
		);

		return res.status(200).json({ success: true });
	}

	/** Removing post from saved **/
	async unsave(req, res) {
		/** Validate required fields **/
		const { isValid, errors } = Validator.validateFields(req);
		if (!isValid) {
			return res.status(400).json({ errors });
		}
		/** Fetching post ID from params **/
		const id = req.params.id;

		/** Updating relation field **/
		await db.models.user.findOneAndUpdate(
			{ _id: req.user._id },
			{ $pull: { savedPosts: id } }
		);

		return res.status(200).json({ success: true });
	}
}

module.exports = new PostController();