export const INVALID_TRAILASSOCIATION_ID = 'Invalid TrailAssociations ID';
export const TRAILASSOCIATION_NOT_FOUND = 'TrailAssociations Not Found';
export const GET_TRAILASSOCIATION_SUCCESS =
	'TrailAssociations fetched successfully';
export const TRAILASSOCIATION_ALREADY_EXIST = 'TrailAssociations already exist';
export const TRAILASSOCIATION_CREATED_SUCCESS =
	'TrailAssociations created successfully';
export const TRAILASSOCIATION_UPDATED_SUCCESS =
	'TrailAssociations updated successfully';
export const TRAILASSOCIATION_DELETED_SUCCESS =
	'TrailAssociations deleted successfully';

export const ALLOWED_TRAILASSOCIATION_SORT_OPTIONS = [
	'id',
	'title',
	'description',
	'lat',
	'lng',
	'regionName',
	'url',
	'created_at',
	'updated_at',
];

const ALLOWED_SORT_DIRECTION = ['asc', 'desc'];
export const INVALID_TRAILASSOCIATION_SORT_OPTION = `Invalid sort options. Allowed sort options are: ${ALLOWED_TRAILASSOCIATION_SORT_OPTIONS.join(
	', ',
)} and Allowed sort direction are: ${ALLOWED_SORT_DIRECTION.join(', ')}`;

export const GET_TRAILASSOCIATION_QUERY_SCHEMA_CONFIG = [
	{
		propertyName: 'title',
		type: 'string',
	},
	{
		propertyName: 'regionName',
		type: 'string',
	},
	{
		propertyName: 'description',
		type: 'string',
	},

	{
		propertyName: 'sort',
		type: 'string',
		test: {
			name: 'is-valid-sort',
			message: INVALID_TRAILASSOCIATION_SORT_OPTION,
			func: value => {
				if (!value) return true;
				const [field, direction] = value.split(':');
				const isValidField =
					ALLOWED_TRAILASSOCIATION_SORT_OPTIONS.includes(field);
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
