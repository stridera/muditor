import { UserRole } from '@muditor/db';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { getJwtSecret } from './jwt-secret';
import { createWsOnConnect, isWsContext, wsContext } from './ws-auth';

const sign = (payload: object, opts: jwt.SignOptions = { expiresIn: '1h' }) =>
  jwt.sign(
    { sub: 'u1', displayName: 'U', role: UserRole.PLAYER, ...payload },
    getJwtSecret(),
    opts
  );

describe('graphql-ws onConnect (real AuthService.validateJwtPayload)', () => {
  const user = {
    id: 'u1',
    displayName: 'U',
    role: UserRole.PLAYER,
    passwordHash: 'h',
    tokenVersion: 2,
    deletedAt: null as Date | null,
  };
  const db = {
    users: { findUnique: jest.fn() },
    banRecords: { findFirst: jest.fn() },
  };
  let onConnect: ReturnType<typeof createWsOnConnect>;
  const connect = (params?: Record<string, unknown>) => {
    const ctx = { connectionParams: params, extra: {} as unknown };
    return onConnect(ctx).then(ok => ({ ok, ctx }));
  };

  beforeEach(() => {
    jest.resetAllMocks();
    db.users.findUnique.mockResolvedValue(user);
    db.banRecords.findFirst.mockResolvedValue(null);
    const authService = new AuthService(db as never, {} as never, {} as never);
    onConnect = createWsOnConnect(authService);
  });

  it('accepts a valid current token and stores the header on the connection', async () => {
    const auth = `Bearer ${sign({ tokenVersion: 2 })}`;
    const { ok, ctx } = await connect({ Authorization: auth });
    expect(ok).toBe(true);
    expect(wsContext(ctx).req.headers.authorization).toBe(auth);
  });

  it('rejects an anonymous connection (no connectionParams / no token)', async () => {
    expect((await connect(undefined)).ok).toBe(false);
    expect((await connect({})).ok).toBe(false);
    expect((await connect({ Authorization: 'Bearer ' })).ok).toBe(false);
    expect(db.users.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a bad signature, an expired token and a non-Bearer header', async () => {
    const forged = jwt.sign({ sub: 'u1', tokenVersion: 2 }, 'not-the-secret');
    expect((await connect({ Authorization: `Bearer ${forged}` })).ok).toBe(
      false
    );
    const expired = sign({ tokenVersion: 2 }, { expiresIn: -10 });
    expect((await connect({ Authorization: `Bearer ${expired}` })).ok).toBe(
      false
    );
    const good = sign({ tokenVersion: 2 });
    expect((await connect({ Authorization: good })).ok).toBe(false);
  });

  it('rejects a banned user', async () => {
    db.banRecords.findFirst.mockResolvedValue({ id: 1 });
    const { ok } = await connect({
      authorization: `Bearer ${sign({ tokenVersion: 2 })}`,
    });
    expect(ok).toBe(false);
  });

  it('rejects a deleted user and an unknown user', async () => {
    const auth = `Bearer ${sign({ tokenVersion: 2 })}`;
    db.users.findUnique.mockResolvedValue({ ...user, deletedAt: new Date() });
    expect((await connect({ Authorization: auth })).ok).toBe(false);
    db.users.findUnique.mockResolvedValue(null);
    expect((await connect({ Authorization: auth })).ok).toBe(false);
  });

  it('rejects a token with a stale tokenVersion (and a pre-claim token)', async () => {
    const stale = `Bearer ${sign({ tokenVersion: 1 })}`;
    expect((await connect({ Authorization: stale })).ok).toBe(false);
    const noClaim = `Bearer ${sign({})}`;
    expect((await connect({ Authorization: noClaim })).ok).toBe(false);
  });

  it('tells graphql-ws contexts apart from HTTP ones', () => {
    expect(isWsContext({ connectionParams: {}, extra: {} })).toBe(true);
    expect(isWsContext({ req: {}, res: {} })).toBe(false);
  });
});
