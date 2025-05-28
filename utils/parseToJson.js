export const parseJsonFields = fields => {
	return (req, res, next) => {
		for (const field of fields) {
			const value = req.body[field];

			if (typeof value === 'string') {
				try {
					req.body[field] = JSON.parse(value);
				} catch (e) {
					req.body[field] = undefined; // Or optionally return 400 error
				}
			}
		}
		console.log('activities', req.body.activities);
		console.log('trailInfo', req.body.trailInfo);
		next();
	};
};
