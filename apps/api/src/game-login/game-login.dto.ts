import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { GameLoginCodeStatus } from '@muditor/db';

registerEnumType(GameLoginCodeStatus, {
  name: 'GameLoginCodeStatus',
  description: 'Lifecycle state of a game login device code',
});

@ObjectType({
  description:
    'A pending game login request created at the telnet prompt, approved from the website',
})
export class GameLoginCodeDto {
  @Field({ description: 'Display form of the code, e.g. ABCD-EFGH' })
  code: string;

  @Field({ description: 'Character name the player typed at the prompt' })
  characterName: string;

  @Field({ description: 'IP address of the connecting telnet client' })
  clientIp: string;

  @Field({ description: 'Whether the telnet connection used TLS' })
  tls: boolean;

  @Field(() => GameLoginCodeStatus)
  status: GameLoginCodeStatus;

  @Field()
  createdAt: Date;

  @Field()
  expiresAt: Date;

  @Field({
    description:
      'True when the account is currently locked in-game; approving still logs the player in',
  })
  accountLocked: boolean;

  @Field(() => Date, { nullable: true })
  lockedUntil?: Date | null;
}

@ObjectType({
  description:
    'Whether a character has a game password (Characters.passwordHash) set',
})
export class CharacterPasswordStatus {
  @Field()
  characterName: string;

  @Field({ description: 'True when a game password hash is stored' })
  isSet: boolean;

  @Field({
    description:
      'True when the stored hash is a legacy crypt(3) hash (not bcrypt)',
  })
  isLegacyHash: boolean;
}

@ObjectType({
  description: 'Remaining website character-link lockout for one character',
})
export class CharacterLinkLockout {
  @Field()
  characterName: string;

  @Field(() => Int)
  remainingSeconds: number;
}

@ObjectType({
  description: 'Game-side account lock and character-link lockout state',
})
export class AccountLockStatus {
  @Field({ description: 'True only while lockedUntil is in the future' })
  locked: boolean;

  @Field(() => Date, { nullable: true })
  lockedUntil?: Date | null;

  @Field(() => Int)
  failedLoginAttempts: number;

  @Field(() => [CharacterLinkLockout])
  characterLinkLockouts: CharacterLinkLockout[];
}
