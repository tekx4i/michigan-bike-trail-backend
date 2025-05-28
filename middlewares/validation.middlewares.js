import { ValidationError as YupValidationError } from 'yup';

import { ValidationError } from '../errors';

export const validate = schema => async (req, res, next) => {
	try {
		const { query, body, params, file, cookies } = await schema.validate(
			{
				body: req.body,
				query: req.query,
				params: req.params,
				file: req.file,
				cookies: req.cookies,
			},
			{
				abortEarly: false,
				stripUnknown: true,
				context: {
					params: req.params, // 👈 Pass params here
				},
			},
		);

		req.body = body;
		req.query = query;
		req.params = params;
		req.file = file;
		req.cookies = cookies;

		return next();
	} catch (err) {
		console.log('Error from validate function: ', err); // comment out this line in production
		if (!(err instanceof YupValidationError)) return next(err);

		const errors = err.inner.map(e => {
			const path = e.path || 'Unknown field';
			return {
				path,
				message: e.message.startsWith(path)
					? e.message.slice(path.length).trim()
					: e.message,
			};
		});

		return next(new ValidationError(errors));
	}
};
