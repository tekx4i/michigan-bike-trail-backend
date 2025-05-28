export const INVALID_RATING_ID = 'Invalid Rating ID';
export const RATING_NOT_FOUND = 'Rating Not Found';
export const GET_RATING_SUCCESS = 'Ratings fetched successfully';
export const RATING_ALREADY_EXIST = 'Rating already exist';
export const RATING_CREATED_SUCCESS = 'Rating created successfully';
export const RATING_UPDATED_SUCCESS = 'Rating updated successfully';
export const RATING_DELETED_SUCCESS = 'Rating deleted successfully';

export const ALLOWED_RATING_SORT_OPTIONS = [
	'id',
	'name',
	'description',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_RATING_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_RATING_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_RATING_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},
	{
		propertyName: 'trail_id',
		type: 'number',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_RATING_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_RATING_SORT_OPTIONS.includes(field);
				const isValidDirection = ALLOWED_SORT_DIRECTION.includes(direction);
				return isValidField && isValidDirection;
			},
		},
	},
	{
		propertyName: 'page',
		type: 'number',
		min: 1,
	},
	{
		propertyName: 'limit',
		type: 'number',
		min: 1,
	},
];
