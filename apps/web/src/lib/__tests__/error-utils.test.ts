import { extractErrorMessage, friendlyGraphQLMessage } from '../error-utils';

describe('friendlyGraphQLMessage', () => {
  it('turns a missing required field into a plain sentence', () => {
    expect(
      friendlyGraphQLMessage(
        'Variable "$data" got invalid value { id: 1 }; Field "roomDescription" of required type "String!" was not provided.'
      )
    ).toBe('Room description is required.');
  });

  it('explains a missing id variable', () => {
    expect(
      friendlyGraphQLMessage(
        'Variable "$zoneId" of non-null type "Int!" must not be null.'
      )
    ).toMatch(/valid id/);
  });

  it('says not found for a null non-nullable query field', () => {
    expect(
      friendlyGraphQLMessage(
        'Cannot return null for non-nullable field Query.mob.'
      )
    ).toBe('That mob could not be found.');
  });

  it('explains a forbidden write', () => {
    expect(friendlyGraphQLMessage('Forbidden resource')).toMatch(
      /write access/
    );
  });

  it('rewrites class-validator lines one by one', () => {
    expect(
      friendlyGraphQLMessage(
        'name should not be empty\nproperty zoneId should not exist'
      )
    ).toBe('Name is required.\nThe field "zoneId" is not accepted here.');
  });

  it('leaves unknown messages alone', () => {
    expect(friendlyGraphQLMessage('Object 5 already exists in zone 30')).toBe(
      'Object 5 already exists in zone 30'
    );
  });
});

describe('extractErrorMessage', () => {
  it('returns the friendly text for an Apollo-style error', () => {
    expect(
      extractErrorMessage({
        message: 'Forbidden resource',
        graphQLErrors: [{ message: 'Forbidden resource' }],
      })
    ).toMatch(/write access/);
  });
});
