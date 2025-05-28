export const INVALID_TRAIL_ID = 'Invalid Trail ID';
export const INVALID_TRAIL_SLUG = 'Invalid Trail SLUG';
export const TRAIL_NOT_FOUND = 'Trail Not Found';
export const TRAIL_FETCHED = 'Trails fetched successfully';
export const TRAIL_ALREADY_EXIST = 'Trail already exists';
export const TRAIL_CREATED = 'Trail created successfully';
export const TRAIL_UPDATED = 'Trail updated successfully';
export const TRAIL_DELETED = 'Trail deleted successfully';
export const FAV_TRAIL_TOGGLED = 'Favourite trail toggled successfully';
export const PARENT_PARK_REQUIRED = 'Parent Park is required';
export const deleteManyTrails = 'Trails deleted successfully';

export const ALLOWED_TRAIL_SORT_OPTIONS = [
	'id',
	'name',
	'difficulty',
	'length',
	'avgRating',
	'rating',
	'location',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_TRAIL_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_TRAIL_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_TRAIL_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'name',
		type: 'string',
	},
	{
		propertyName: 'location',
		type: 'string',
	},
	{
		propertyName: 'surfaceType',
		type: 'string',
	},
	{
		propertyName: 'type',
		type: 'string',
	},
	{
		propertyName: 'trailCase',
		type: 'string',
	},
	{
		propertyName: 'difficultyLevel',
		type: 'string',
	},
	{
		propertyName: 'trailDistance',
		type: 'string',
	},
	{
		propertyName: 'avgRating',
		type: 'number',
		min: 0,
		max: 5,
	},
	{
		propertyName: 'length',
		type: 'number',
		min: 0,
	},
	{
		propertyName: 'search',
		type: 'string',
	},
	{
		propertyName: 'status',
		type: 'string',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_TRAIL_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_TRAIL_SORT_OPTIONS.includes(field);
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

export const GET_PARK_QUERY_SCHEMA_CONFIG = [];

export const GET_NEAR_BY_TRAIL_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'location',
		type: 'string',
	},
	{
		propertyName: 'difficultyLevel',
		type: 'string',
	},
	{
		propertyName: 'trailSlug',
		type: 'string',
	},
	{
		propertyName: 'type',
		type: 'string',
	},
	{
		asc: 'difficultyLevel',
		type: 'string',
	},
	{
		propertyName: 'status',
		type: 'string',
	},
	{
		desc: 'difficultyLevel',
		type: 'string',
	},
	{
		propertyName: 'length',
		type: 'number',
		min: 0,
	},
	{
		propertyName: 'rating',
		type: 'number',
		min: 1,
		max: 5,
	},
	{
		propertyName: 'lat',
		type: 'number',
	},
	{
		propertyName: 'lng',
		type: 'number',
	},
	{
		propertyName: 'distance',
		type: 'number',
		min: 1, // Ensure a valid distance value
	},
	{
		propertyName: 'trailDistance',
		type: 'string',
		// pattern: /^\[\d+-\d+\]$/, // Matches "[1-10]", "[5-15]", etc.
		// errorMessage: 'Distance must be in the format "[min-max]" like "[1-10]"',
	},
	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_TRAIL_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField = ALLOWED_TRAIL_SORT_OPTIONS.includes(field);
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
