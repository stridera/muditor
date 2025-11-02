/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query GetMyCharacters {\n    myCharacters {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      copper\n      silver\n      gold\n      platinum\n      description\n      title\n      currentRoom\n    }\n  }\n": typeof types.GetMyCharactersDocument,
    "\n  query GetObject($id: Int!, $zoneId: Int!) {\n    object(id: $id, zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      examineDescription\n      actionDesc\n      weight\n      cost\n      timer\n      decomposeTimer\n      level\n      concealment\n      values\n      zoneId\n      flags\n      effectFlags\n      wearFlags\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetObjectDocument,
    "\n  mutation UpdateObject($id: Int!, $zoneId: Int!, $data: UpdateObjectInput!) {\n    updateObject(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      keywords\n      name\n      examineDescription\n    }\n  }\n": typeof types.UpdateObjectDocument,
    "\n  mutation CreateObject($data: CreateObjectInput!) {\n    createObject(data: $data) {\n      id\n      keywords\n      name\n    }\n  }\n": typeof types.CreateObjectDocument,
    "\n  query GetObjectsDashboard {\n    objects(take: 100) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n": typeof types.GetObjectsDashboardDocument,
    "\n  query GetObjectsByZoneDashboard($zoneId: Int!) {\n    objectsByZone(zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n": typeof types.GetObjectsByZoneDashboardDocument,
    "\n  mutation DeleteObject($id: Int!, $zoneId: Int!) {\n    deleteObject(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n": typeof types.DeleteObjectDocument,
    "\n  mutation DeleteObjects($ids: [Int!]!) {\n    deleteObjects(ids: $ids)\n  }\n": typeof types.DeleteObjectsDocument,
    "\n  query GetDashboardStats {\n    zonesCount\n    roomsCount\n    mobsCount\n    objectsCount\n    shopsCount\n  }\n": typeof types.GetDashboardStatsDocument,
    "\n  query GetShop($id: Int!, $zoneId: Int!) {\n    shop(id: $id, zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      zoneId\n      flags\n      tradesWithFlags\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n      hours {\n        id\n        open\n        close\n      }\n    }\n  }\n": typeof types.GetShopDocument,
    "\n  query GetAvailableObjects {\n    objects {\n      id\n      keywords\n      name\n      type\n      cost\n      zoneId\n    }\n  }\n": typeof types.GetAvailableObjectsDocument,
    "\n  query GetAvailableMobs {\n    mobs {\n      id\n      keywords\n      name\n      zoneId\n    }\n  }\n": typeof types.GetAvailableMobsDocument,
    "\n  mutation UpdateShop($id: Int!, $zoneId: Int!, $data: UpdateShopInput!) {\n    updateShop(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n": typeof types.UpdateShopDocument,
    "\n  mutation CreateShop($data: CreateShopInput!) {\n    createShop(data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n": typeof types.CreateShopDocument,
    "\n  query GetShops {\n    shops {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n": typeof types.GetShopsDocument,
    "\n  query GetShopsByZone($zoneId: Int!) {\n    shopsByZone(zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n": typeof types.GetShopsByZoneDocument,
    "\n  mutation DeleteShop($id: Int!, $zoneId: Int!) {\n    deleteShop(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n": typeof types.DeleteShopDocument,
    "\n  query Users {\n    users {\n      id\n      username\n      email\n      role\n      isBanned\n      createdAt\n      lastLoginAt\n      banRecords {\n        id\n        reason\n        bannedAt\n        expiresAt\n        admin {\n          username\n        }\n      }\n    }\n  }\n": typeof types.UsersDocument,
    "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      email\n      role\n    }\n  }\n": typeof types.UpdateUserDocument,
    "\n  mutation BanUser($input: BanUserInput!) {\n    banUser(input: $input) {\n      id\n      reason\n      bannedAt\n      userId\n    }\n  }\n": typeof types.BanUserDocument,
    "\n  mutation UnbanUser($input: UnbanUserInput!) {\n    unbanUser(input: $input) {\n      id\n      unbannedAt\n      userId\n    }\n  }\n": typeof types.UnbanUserDocument,
    "\n  query GetZones {\n    zones {\n      id\n      name\n      climate\n    }\n  }\n": typeof types.GetZonesDocument,
    "\n  query GetRoomsByZone($zoneId: Int!) {\n    roomsByZone(zoneId: $zoneId) {\n      id\n      name\n      roomDescription\n      layoutX\n      layoutY\n      layoutZ\n      exits {\n        direction\n        destination\n      }\n    }\n  }\n": typeof types.GetRoomsByZoneDocument,
    "\n  query GetZonesDashboard {\n    zones {\n      id\n      name\n      climate\n    }\n    roomsCount\n  }\n": typeof types.GetZonesDashboardDocument,
    "\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input) {\n      success\n      message\n    }\n  }\n": typeof types.RequestPasswordResetDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n": typeof types.ChangePasswordDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n": typeof types.ResetPasswordDocument,
    "\n  query GetTriggers {\n    triggers {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetTriggersDocument,
    "\n  query GetTriggersByAttachment($attachType: ScriptType!, $entityId: Int!) {\n    triggersByAttachment(attachType: $attachType, entityId: $entityId) {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.GetTriggersByAttachmentDocument,
    "\n  mutation CreateTrigger($input: CreateTriggerInput!) {\n    createTrigger(input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n": typeof types.CreateTriggerDocument,
    "\n  mutation UpdateTrigger($id: Float!, $input: UpdateTriggerInput!) {\n    updateTrigger(id: $id, input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n": typeof types.UpdateTriggerDocument,
    "\n  mutation DeleteTrigger($id: Float!) {\n    deleteTrigger(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteTriggerDocument,
    "\n  mutation AttachTrigger($input: AttachTriggerInput!) {\n    attachTrigger(input: $input) {\n      id\n      name\n      mobId\n      objectId\n      zoneId\n    }\n  }\n": typeof types.AttachTriggerDocument,
    "\n  mutation DetachTrigger($triggerId: Float!) {\n    detachTrigger(triggerId: $triggerId) {\n      id\n      name\n    }\n  }\n": typeof types.DetachTriggerDocument,
    "\n  query GetZonesForSelector {\n    zones {\n      id\n      name\n    }\n  }\n": typeof types.GetZonesForSelectorDocument,
    "\n  mutation CreateCharacter($data: CreateCharacterInput!) {\n    createCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n    }\n  }\n": typeof types.CreateCharacterDocument,
    "\n  query GetCharacterDetails($id: ID!) {\n    character(id: $id) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      skillPoints\n      copper\n      silver\n      gold\n      platinum\n      bankCopper\n      bankSilver\n      bankGold\n      bankPlatinum\n      description\n      title\n      currentRoom\n      saveRoom\n      homeRoom\n      hunger\n      thirst\n      hitRoll\n      damageRoll\n      armorClass\n      playerFlags\n      effectFlags\n      privilegeFlags\n      invisLevel\n      birthTime\n      items {\n        id\n        equippedLocation\n        condition\n        charges\n        objectPrototype {\n          id\n          name\n          type\n        }\n      }\n      effects {\n        id\n        effectName\n        effectType\n        duration\n        strength\n        appliedAt\n        expiresAt\n      }\n    }\n  }\n": typeof types.GetCharacterDetailsDocument,
    "\n  query GetCharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n": typeof types.GetCharacterSessionInfoDocument,
    "\n  query GetCharacterLinkingInfo($characterName: String!) {\n    characterLinkingInfo(characterName: $characterName) {\n      id\n      name\n      level\n      race\n      class\n      lastLogin\n      timePlayed\n      isOnline\n      isLinked\n      hasPassword\n    }\n  }\n": typeof types.GetCharacterLinkingInfoDocument,
    "\n  mutation LinkCharacter($data: LinkCharacterInput!) {\n    linkCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n    }\n  }\n": typeof types.LinkCharacterDocument,
    "\n  query ValidateCharacterPassword($characterName: String!, $password: String!) {\n    validateCharacterPassword(\n      characterName: $characterName\n      password: $password\n    )\n  }\n": typeof types.ValidateCharacterPasswordDocument,
    "\n  query GetEquipmentSets {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n          keywords\n        }\n      }\n    }\n  }\n": typeof types.GetEquipmentSetsDocument,
    "\n  query GetObjectsForEquipmentSet($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n": typeof types.GetObjectsForEquipmentSetDocument,
    "\n  mutation CreateEquipmentSet($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n      createdAt\n    }\n  }\n": typeof types.CreateEquipmentSetDocument,
    "\n  mutation UpdateEquipmentSet($id: ID!, $data: UpdateEquipmentSetInput!) {\n    updateEquipmentSet(id: $id, data: $data) {\n      id\n      name\n      description\n      updatedAt\n    }\n  }\n": typeof types.UpdateEquipmentSetDocument,
    "\n  mutation DeleteEquipmentSet($id: ID!) {\n    deleteEquipmentSet(id: $id)\n  }\n": typeof types.DeleteEquipmentSetDocument,
    "\n  mutation AddEquipmentSetItem($data: CreateEquipmentSetItemStandaloneInput!) {\n    createEquipmentSetItem(data: $data) {\n      id\n      slot\n      probability\n    }\n  }\n": typeof types.AddEquipmentSetItemDocument,
    "\n  mutation RemoveEquipmentSetItem($id: ID!) {\n    deleteEquipmentSetItem(id: $id)\n  }\n": typeof types.RemoveEquipmentSetItemDocument,
    "\n  query GetMobResetsLegacy($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n": typeof types.GetMobResetsLegacyDocument,
    "\n  query GetObjectsLegacy($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n": typeof types.GetObjectsLegacyDocument,
    "\n  mutation CreateMobReset($data: CreateMobResetInput!) {\n    createMobReset(data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n": typeof types.CreateMobResetDocument,
    "\n  mutation UpdateMobReset($id: ID!, $data: UpdateMobResetInput!) {\n    updateMobReset(id: $id, data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n": typeof types.UpdateMobResetDocument,
    "\n  mutation DeleteMobReset($id: ID!) {\n    deleteMobReset(id: $id)\n  }\n": typeof types.DeleteMobResetDocument,
    "\n  mutation DeleteMobResetEquipment($id: ID!) {\n    deleteMobResetEquipment(id: $id)\n  }\n": typeof types.DeleteMobResetEquipmentDocument,
    "\n  query GetMobResetsForMob($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n": typeof types.GetMobResetsForMobDocument,
    "\n  query GetEquipmentSetsForMob {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n": typeof types.GetEquipmentSetsForMobDocument,
    "\n  query GetObjectsForMob($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n": typeof types.GetObjectsForMobDocument,
    "\n  mutation CreateEquipmentSetForMob($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n    }\n  }\n": typeof types.CreateEquipmentSetForMobDocument,
    "\n  mutation AddMobEquipmentSet($data: CreateMobEquipmentSetInput!) {\n    createMobEquipmentSet(data: $data) {\n      id\n      probability\n    }\n  }\n": typeof types.AddMobEquipmentSetDocument,
    "\n  mutation RemoveMobEquipmentSet($id: ID!) {\n    deleteMobEquipmentSet(id: $id)\n  }\n": typeof types.RemoveMobEquipmentSetDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  query Me {\n    me {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n": typeof types.MeDocument,
    "mutation UpdateMob($zoneId: Int!, $id: Int!, $data: UpdateMobInput!) {\n  updateMob(zoneId: $zoneId, id: $id, data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation CreateMob($data: CreateMobInput!) {\n  createMob(data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation DeleteMob($zoneId: Int!, $id: Int!) {\n  deleteMob(zoneId: $zoneId, id: $id) {\n    id\n    zoneId\n  }\n}": typeof types.UpdateMobDocument,
    "query GetMob($id: Int!, $zoneId: Int!) {\n  mob(id: $id, zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n    createdAt\n    updatedAt\n  }\n}\n\nquery GetMobs($skip: Int, $take: Int) {\n  mobs(skip: $skip, take: $take) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    lifeForce\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n  }\n}\n\nquery GetMobsByZone($zoneId: Int!) {\n  mobsByZone(zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    wealth\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n    lifeForce\n  }\n}": typeof types.GetMobDocument,
    "\n  query OnlineCharacters($userId: ID) {\n    onlineCharacters(userId: $userId) {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n": typeof types.OnlineCharactersDocument,
    "\n  query MyOnlineCharacters {\n    myOnlineCharacters {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n": typeof types.MyOnlineCharactersDocument,
    "\n  query CharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n": typeof types.CharacterSessionInfoDocument,
    "\n  mutation SetCharacterOnline($characterId: ID!) {\n    setCharacterOnline(characterId: $characterId)\n  }\n": typeof types.SetCharacterOnlineDocument,
    "\n  mutation SetCharacterOffline($characterId: ID!) {\n    setCharacterOffline(characterId: $characterId)\n  }\n": typeof types.SetCharacterOfflineDocument,
    "\n  mutation UpdateCharacterActivity($characterId: ID!) {\n    updateCharacterActivity(characterId: $characterId)\n  }\n": typeof types.UpdateCharacterActivityDocument,
    "\n  query MyPermissions {\n    myPermissions {\n      isPlayer\n      isImmortal\n      isBuilder\n      isCoder\n      isGod\n      canAccessDashboard\n      canManageUsers\n      canViewValidation\n      maxCharacterLevel\n      role\n    }\n  }\n": typeof types.MyPermissionsDocument,
};
const documents: Documents = {
    "\n  query GetMyCharacters {\n    myCharacters {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      copper\n      silver\n      gold\n      platinum\n      description\n      title\n      currentRoom\n    }\n  }\n": types.GetMyCharactersDocument,
    "\n  query GetObject($id: Int!, $zoneId: Int!) {\n    object(id: $id, zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      examineDescription\n      actionDesc\n      weight\n      cost\n      timer\n      decomposeTimer\n      level\n      concealment\n      values\n      zoneId\n      flags\n      effectFlags\n      wearFlags\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetObjectDocument,
    "\n  mutation UpdateObject($id: Int!, $zoneId: Int!, $data: UpdateObjectInput!) {\n    updateObject(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      keywords\n      name\n      examineDescription\n    }\n  }\n": types.UpdateObjectDocument,
    "\n  mutation CreateObject($data: CreateObjectInput!) {\n    createObject(data: $data) {\n      id\n      keywords\n      name\n    }\n  }\n": types.CreateObjectDocument,
    "\n  query GetObjectsDashboard {\n    objects(take: 100) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n": types.GetObjectsDashboardDocument,
    "\n  query GetObjectsByZoneDashboard($zoneId: Int!) {\n    objectsByZone(zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n": types.GetObjectsByZoneDashboardDocument,
    "\n  mutation DeleteObject($id: Int!, $zoneId: Int!) {\n    deleteObject(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n": types.DeleteObjectDocument,
    "\n  mutation DeleteObjects($ids: [Int!]!) {\n    deleteObjects(ids: $ids)\n  }\n": types.DeleteObjectsDocument,
    "\n  query GetDashboardStats {\n    zonesCount\n    roomsCount\n    mobsCount\n    objectsCount\n    shopsCount\n  }\n": types.GetDashboardStatsDocument,
    "\n  query GetShop($id: Int!, $zoneId: Int!) {\n    shop(id: $id, zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      zoneId\n      flags\n      tradesWithFlags\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n      hours {\n        id\n        open\n        close\n      }\n    }\n  }\n": types.GetShopDocument,
    "\n  query GetAvailableObjects {\n    objects {\n      id\n      keywords\n      name\n      type\n      cost\n      zoneId\n    }\n  }\n": types.GetAvailableObjectsDocument,
    "\n  query GetAvailableMobs {\n    mobs {\n      id\n      keywords\n      name\n      zoneId\n    }\n  }\n": types.GetAvailableMobsDocument,
    "\n  mutation UpdateShop($id: Int!, $zoneId: Int!, $data: UpdateShopInput!) {\n    updateShop(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n": types.UpdateShopDocument,
    "\n  mutation CreateShop($data: CreateShopInput!) {\n    createShop(data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n": types.CreateShopDocument,
    "\n  query GetShops {\n    shops {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n": types.GetShopsDocument,
    "\n  query GetShopsByZone($zoneId: Int!) {\n    shopsByZone(zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n": types.GetShopsByZoneDocument,
    "\n  mutation DeleteShop($id: Int!, $zoneId: Int!) {\n    deleteShop(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n": types.DeleteShopDocument,
    "\n  query Users {\n    users {\n      id\n      username\n      email\n      role\n      isBanned\n      createdAt\n      lastLoginAt\n      banRecords {\n        id\n        reason\n        bannedAt\n        expiresAt\n        admin {\n          username\n        }\n      }\n    }\n  }\n": types.UsersDocument,
    "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      email\n      role\n    }\n  }\n": types.UpdateUserDocument,
    "\n  mutation BanUser($input: BanUserInput!) {\n    banUser(input: $input) {\n      id\n      reason\n      bannedAt\n      userId\n    }\n  }\n": types.BanUserDocument,
    "\n  mutation UnbanUser($input: UnbanUserInput!) {\n    unbanUser(input: $input) {\n      id\n      unbannedAt\n      userId\n    }\n  }\n": types.UnbanUserDocument,
    "\n  query GetZones {\n    zones {\n      id\n      name\n      climate\n    }\n  }\n": types.GetZonesDocument,
    "\n  query GetRoomsByZone($zoneId: Int!) {\n    roomsByZone(zoneId: $zoneId) {\n      id\n      name\n      roomDescription\n      layoutX\n      layoutY\n      layoutZ\n      exits {\n        direction\n        destination\n      }\n    }\n  }\n": types.GetRoomsByZoneDocument,
    "\n  query GetZonesDashboard {\n    zones {\n      id\n      name\n      climate\n    }\n    roomsCount\n  }\n": types.GetZonesDashboardDocument,
    "\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input) {\n      success\n      message\n    }\n  }\n": types.RequestPasswordResetDocument,
    "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n": types.ChangePasswordDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n": types.ResetPasswordDocument,
    "\n  query GetTriggers {\n    triggers {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetTriggersDocument,
    "\n  query GetTriggersByAttachment($attachType: ScriptType!, $entityId: Int!) {\n    triggersByAttachment(attachType: $attachType, entityId: $entityId) {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n": types.GetTriggersByAttachmentDocument,
    "\n  mutation CreateTrigger($input: CreateTriggerInput!) {\n    createTrigger(input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n": types.CreateTriggerDocument,
    "\n  mutation UpdateTrigger($id: Float!, $input: UpdateTriggerInput!) {\n    updateTrigger(id: $id, input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n": types.UpdateTriggerDocument,
    "\n  mutation DeleteTrigger($id: Float!) {\n    deleteTrigger(id: $id) {\n      id\n    }\n  }\n": types.DeleteTriggerDocument,
    "\n  mutation AttachTrigger($input: AttachTriggerInput!) {\n    attachTrigger(input: $input) {\n      id\n      name\n      mobId\n      objectId\n      zoneId\n    }\n  }\n": types.AttachTriggerDocument,
    "\n  mutation DetachTrigger($triggerId: Float!) {\n    detachTrigger(triggerId: $triggerId) {\n      id\n      name\n    }\n  }\n": types.DetachTriggerDocument,
    "\n  query GetZonesForSelector {\n    zones {\n      id\n      name\n    }\n  }\n": types.GetZonesForSelectorDocument,
    "\n  mutation CreateCharacter($data: CreateCharacterInput!) {\n    createCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n    }\n  }\n": types.CreateCharacterDocument,
    "\n  query GetCharacterDetails($id: ID!) {\n    character(id: $id) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      skillPoints\n      copper\n      silver\n      gold\n      platinum\n      bankCopper\n      bankSilver\n      bankGold\n      bankPlatinum\n      description\n      title\n      currentRoom\n      saveRoom\n      homeRoom\n      hunger\n      thirst\n      hitRoll\n      damageRoll\n      armorClass\n      playerFlags\n      effectFlags\n      privilegeFlags\n      invisLevel\n      birthTime\n      items {\n        id\n        equippedLocation\n        condition\n        charges\n        objectPrototype {\n          id\n          name\n          type\n        }\n      }\n      effects {\n        id\n        effectName\n        effectType\n        duration\n        strength\n        appliedAt\n        expiresAt\n      }\n    }\n  }\n": types.GetCharacterDetailsDocument,
    "\n  query GetCharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n": types.GetCharacterSessionInfoDocument,
    "\n  query GetCharacterLinkingInfo($characterName: String!) {\n    characterLinkingInfo(characterName: $characterName) {\n      id\n      name\n      level\n      race\n      class\n      lastLogin\n      timePlayed\n      isOnline\n      isLinked\n      hasPassword\n    }\n  }\n": types.GetCharacterLinkingInfoDocument,
    "\n  mutation LinkCharacter($data: LinkCharacterInput!) {\n    linkCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n    }\n  }\n": types.LinkCharacterDocument,
    "\n  query ValidateCharacterPassword($characterName: String!, $password: String!) {\n    validateCharacterPassword(\n      characterName: $characterName\n      password: $password\n    )\n  }\n": types.ValidateCharacterPasswordDocument,
    "\n  query GetEquipmentSets {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n          keywords\n        }\n      }\n    }\n  }\n": types.GetEquipmentSetsDocument,
    "\n  query GetObjectsForEquipmentSet($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n": types.GetObjectsForEquipmentSetDocument,
    "\n  mutation CreateEquipmentSet($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n      createdAt\n    }\n  }\n": types.CreateEquipmentSetDocument,
    "\n  mutation UpdateEquipmentSet($id: ID!, $data: UpdateEquipmentSetInput!) {\n    updateEquipmentSet(id: $id, data: $data) {\n      id\n      name\n      description\n      updatedAt\n    }\n  }\n": types.UpdateEquipmentSetDocument,
    "\n  mutation DeleteEquipmentSet($id: ID!) {\n    deleteEquipmentSet(id: $id)\n  }\n": types.DeleteEquipmentSetDocument,
    "\n  mutation AddEquipmentSetItem($data: CreateEquipmentSetItemStandaloneInput!) {\n    createEquipmentSetItem(data: $data) {\n      id\n      slot\n      probability\n    }\n  }\n": types.AddEquipmentSetItemDocument,
    "\n  mutation RemoveEquipmentSetItem($id: ID!) {\n    deleteEquipmentSetItem(id: $id)\n  }\n": types.RemoveEquipmentSetItemDocument,
    "\n  query GetMobResetsLegacy($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n": types.GetMobResetsLegacyDocument,
    "\n  query GetObjectsLegacy($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n": types.GetObjectsLegacyDocument,
    "\n  mutation CreateMobReset($data: CreateMobResetInput!) {\n    createMobReset(data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n": types.CreateMobResetDocument,
    "\n  mutation UpdateMobReset($id: ID!, $data: UpdateMobResetInput!) {\n    updateMobReset(id: $id, data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n": types.UpdateMobResetDocument,
    "\n  mutation DeleteMobReset($id: ID!) {\n    deleteMobReset(id: $id)\n  }\n": types.DeleteMobResetDocument,
    "\n  mutation DeleteMobResetEquipment($id: ID!) {\n    deleteMobResetEquipment(id: $id)\n  }\n": types.DeleteMobResetEquipmentDocument,
    "\n  query GetMobResetsForMob($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n": types.GetMobResetsForMobDocument,
    "\n  query GetEquipmentSetsForMob {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n": types.GetEquipmentSetsForMobDocument,
    "\n  query GetObjectsForMob($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n": types.GetObjectsForMobDocument,
    "\n  mutation CreateEquipmentSetForMob($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n    }\n  }\n": types.CreateEquipmentSetForMobDocument,
    "\n  mutation AddMobEquipmentSet($data: CreateMobEquipmentSetInput!) {\n    createMobEquipmentSet(data: $data) {\n      id\n      probability\n    }\n  }\n": types.AddMobEquipmentSetDocument,
    "\n  mutation RemoveMobEquipmentSet($id: ID!) {\n    deleteMobEquipmentSet(id: $id)\n  }\n": types.RemoveMobEquipmentSetDocument,
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n": types.RegisterDocument,
    "\n  query Me {\n    me {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n": types.MeDocument,
    "mutation UpdateMob($zoneId: Int!, $id: Int!, $data: UpdateMobInput!) {\n  updateMob(zoneId: $zoneId, id: $id, data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation CreateMob($data: CreateMobInput!) {\n  createMob(data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation DeleteMob($zoneId: Int!, $id: Int!) {\n  deleteMob(zoneId: $zoneId, id: $id) {\n    id\n    zoneId\n  }\n}": types.UpdateMobDocument,
    "query GetMob($id: Int!, $zoneId: Int!) {\n  mob(id: $id, zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n    createdAt\n    updatedAt\n  }\n}\n\nquery GetMobs($skip: Int, $take: Int) {\n  mobs(skip: $skip, take: $take) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    lifeForce\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n  }\n}\n\nquery GetMobsByZone($zoneId: Int!) {\n  mobsByZone(zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    wealth\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n    lifeForce\n  }\n}": types.GetMobDocument,
    "\n  query OnlineCharacters($userId: ID) {\n    onlineCharacters(userId: $userId) {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n": types.OnlineCharactersDocument,
    "\n  query MyOnlineCharacters {\n    myOnlineCharacters {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n": types.MyOnlineCharactersDocument,
    "\n  query CharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n": types.CharacterSessionInfoDocument,
    "\n  mutation SetCharacterOnline($characterId: ID!) {\n    setCharacterOnline(characterId: $characterId)\n  }\n": types.SetCharacterOnlineDocument,
    "\n  mutation SetCharacterOffline($characterId: ID!) {\n    setCharacterOffline(characterId: $characterId)\n  }\n": types.SetCharacterOfflineDocument,
    "\n  mutation UpdateCharacterActivity($characterId: ID!) {\n    updateCharacterActivity(characterId: $characterId)\n  }\n": types.UpdateCharacterActivityDocument,
    "\n  query MyPermissions {\n    myPermissions {\n      isPlayer\n      isImmortal\n      isBuilder\n      isCoder\n      isGod\n      canAccessDashboard\n      canManageUsers\n      canViewValidation\n      maxCharacterLevel\n      role\n    }\n  }\n": types.MyPermissionsDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMyCharacters {\n    myCharacters {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      copper\n      silver\n      gold\n      platinum\n      description\n      title\n      currentRoom\n    }\n  }\n"): (typeof documents)["\n  query GetMyCharacters {\n    myCharacters {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      copper\n      silver\n      gold\n      platinum\n      description\n      title\n      currentRoom\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetObject($id: Int!, $zoneId: Int!) {\n    object(id: $id, zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      examineDescription\n      actionDesc\n      weight\n      cost\n      timer\n      decomposeTimer\n      level\n      concealment\n      values\n      zoneId\n      flags\n      effectFlags\n      wearFlags\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetObject($id: Int!, $zoneId: Int!) {\n    object(id: $id, zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      examineDescription\n      actionDesc\n      weight\n      cost\n      timer\n      decomposeTimer\n      level\n      concealment\n      values\n      zoneId\n      flags\n      effectFlags\n      wearFlags\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateObject($id: Int!, $zoneId: Int!, $data: UpdateObjectInput!) {\n    updateObject(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      keywords\n      name\n      examineDescription\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateObject($id: Int!, $zoneId: Int!, $data: UpdateObjectInput!) {\n    updateObject(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      keywords\n      name\n      examineDescription\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateObject($data: CreateObjectInput!) {\n    createObject(data: $data) {\n      id\n      keywords\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation CreateObject($data: CreateObjectInput!) {\n    createObject(data: $data) {\n      id\n      keywords\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetObjectsDashboard {\n    objects(take: 100) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n"): (typeof documents)["\n  query GetObjectsDashboard {\n    objects(take: 100) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetObjectsByZoneDashboard($zoneId: Int!) {\n    objectsByZone(zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n"): (typeof documents)["\n  query GetObjectsByZoneDashboard($zoneId: Int!) {\n    objectsByZone(zoneId: $zoneId) {\n      id\n      type\n      keywords\n      name\n      level\n      weight\n      cost\n      zoneId\n      values\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteObject($id: Int!, $zoneId: Int!) {\n    deleteObject(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteObject($id: Int!, $zoneId: Int!) {\n    deleteObject(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteObjects($ids: [Int!]!) {\n    deleteObjects(ids: $ids)\n  }\n"): (typeof documents)["\n  mutation DeleteObjects($ids: [Int!]!) {\n    deleteObjects(ids: $ids)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetDashboardStats {\n    zonesCount\n    roomsCount\n    mobsCount\n    objectsCount\n    shopsCount\n  }\n"): (typeof documents)["\n  query GetDashboardStats {\n    zonesCount\n    roomsCount\n    mobsCount\n    objectsCount\n    shopsCount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetShop($id: Int!, $zoneId: Int!) {\n    shop(id: $id, zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      zoneId\n      flags\n      tradesWithFlags\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n      hours {\n        id\n        open\n        close\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetShop($id: Int!, $zoneId: Int!) {\n    shop(id: $id, zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      zoneId\n      flags\n      tradesWithFlags\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n      hours {\n        id\n        open\n        close\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAvailableObjects {\n    objects {\n      id\n      keywords\n      name\n      type\n      cost\n      zoneId\n    }\n  }\n"): (typeof documents)["\n  query GetAvailableObjects {\n    objects {\n      id\n      keywords\n      name\n      type\n      cost\n      zoneId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAvailableMobs {\n    mobs {\n      id\n      keywords\n      name\n      zoneId\n    }\n  }\n"): (typeof documents)["\n  query GetAvailableMobs {\n    mobs {\n      id\n      keywords\n      name\n      zoneId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateShop($id: Int!, $zoneId: Int!, $data: UpdateShopInput!) {\n    updateShop(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateShop($id: Int!, $zoneId: Int!, $data: UpdateShopInput!) {\n    updateShop(id: $id, zoneId: $zoneId, data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateShop($data: CreateShopInput!) {\n    createShop(data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n"): (typeof documents)["\n  mutation CreateShop($data: CreateShopInput!) {\n    createShop(data: $data) {\n      id\n      buyProfit\n      sellProfit\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetShops {\n    shops {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetShops {\n    shops {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetShopsByZone($zoneId: Int!) {\n    shopsByZone(zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetShopsByZone($zoneId: Int!) {\n    shopsByZone(zoneId: $zoneId) {\n      id\n      buyProfit\n      sellProfit\n      temper\n      flags\n      tradesWithFlags\n      noSuchItemMessages\n      doNotBuyMessages\n      missingCashMessages\n      buyMessages\n      sellMessages\n      keeperId\n      keeper {\n        id\n        zoneId\n        name\n        keywords\n      }\n      zoneId\n      createdAt\n      updatedAt\n      items {\n        id\n        amount\n        objectId\n        object {\n          id\n          zoneId\n          name\n          type\n          cost\n        }\n      }\n      accepts {\n        id\n        type\n        keywords\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteShop($id: Int!, $zoneId: Int!) {\n    deleteShop(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteShop($id: Int!, $zoneId: Int!) {\n    deleteShop(id: $id, zoneId: $zoneId) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Users {\n    users {\n      id\n      username\n      email\n      role\n      isBanned\n      createdAt\n      lastLoginAt\n      banRecords {\n        id\n        reason\n        bannedAt\n        expiresAt\n        admin {\n          username\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Users {\n    users {\n      id\n      username\n      email\n      role\n      isBanned\n      createdAt\n      lastLoginAt\n      banRecords {\n        id\n        reason\n        bannedAt\n        expiresAt\n        admin {\n          username\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      email\n      role\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateUser($input: UpdateUserInput!) {\n    updateUser(input: $input) {\n      id\n      username\n      email\n      role\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation BanUser($input: BanUserInput!) {\n    banUser(input: $input) {\n      id\n      reason\n      bannedAt\n      userId\n    }\n  }\n"): (typeof documents)["\n  mutation BanUser($input: BanUserInput!) {\n    banUser(input: $input) {\n      id\n      reason\n      bannedAt\n      userId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UnbanUser($input: UnbanUserInput!) {\n    unbanUser(input: $input) {\n      id\n      unbannedAt\n      userId\n    }\n  }\n"): (typeof documents)["\n  mutation UnbanUser($input: UnbanUserInput!) {\n    unbanUser(input: $input) {\n      id\n      unbannedAt\n      userId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetZones {\n    zones {\n      id\n      name\n      climate\n    }\n  }\n"): (typeof documents)["\n  query GetZones {\n    zones {\n      id\n      name\n      climate\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetRoomsByZone($zoneId: Int!) {\n    roomsByZone(zoneId: $zoneId) {\n      id\n      name\n      roomDescription\n      layoutX\n      layoutY\n      layoutZ\n      exits {\n        direction\n        destination\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetRoomsByZone($zoneId: Int!) {\n    roomsByZone(zoneId: $zoneId) {\n      id\n      name\n      roomDescription\n      layoutX\n      layoutY\n      layoutZ\n      exits {\n        direction\n        destination\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetZonesDashboard {\n    zones {\n      id\n      name\n      climate\n    }\n    roomsCount\n  }\n"): (typeof documents)["\n  query GetZonesDashboard {\n    zones {\n      id\n      name\n      climate\n    }\n    roomsCount\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input) {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {\n    requestPasswordReset(input: $input) {\n      success\n      message\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ChangePassword($input: ChangePasswordInput!) {\n    changePassword(input: $input) {\n      success\n      message\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n"): (typeof documents)["\n  mutation ResetPassword($input: ResetPasswordInput!) {\n    resetPassword(input: $input) {\n      success\n      message\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTriggers {\n    triggers {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetTriggers {\n    triggers {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTriggersByAttachment($attachType: ScriptType!, $entityId: Int!) {\n    triggersByAttachment(attachType: $attachType, entityId: $entityId) {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query GetTriggersByAttachment($attachType: ScriptType!, $entityId: Int!) {\n    triggersByAttachment(attachType: $attachType, entityId: $entityId) {\n      id\n      name\n      attachType\n      numArgs\n      argList\n      commands\n      variables\n      mobId\n      objectId\n      zoneId\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateTrigger($input: CreateTriggerInput!) {\n    createTrigger(input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTrigger($input: CreateTriggerInput!) {\n    createTrigger(input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateTrigger($id: Float!, $input: UpdateTriggerInput!) {\n    updateTrigger(id: $id, input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTrigger($id: Float!, $input: UpdateTriggerInput!) {\n    updateTrigger(id: $id, input: $input) {\n      id\n      name\n      attachType\n      commands\n      variables\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteTrigger($id: Float!) {\n    deleteTrigger(id: $id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteTrigger($id: Float!) {\n    deleteTrigger(id: $id) {\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AttachTrigger($input: AttachTriggerInput!) {\n    attachTrigger(input: $input) {\n      id\n      name\n      mobId\n      objectId\n      zoneId\n    }\n  }\n"): (typeof documents)["\n  mutation AttachTrigger($input: AttachTriggerInput!) {\n    attachTrigger(input: $input) {\n      id\n      name\n      mobId\n      objectId\n      zoneId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DetachTrigger($triggerId: Float!) {\n    detachTrigger(triggerId: $triggerId) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation DetachTrigger($triggerId: Float!) {\n    detachTrigger(triggerId: $triggerId) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetZonesForSelector {\n    zones {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  query GetZonesForSelector {\n    zones {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateCharacter($data: CreateCharacterInput!) {\n    createCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n    }\n  }\n"): (typeof documents)["\n  mutation CreateCharacter($data: CreateCharacterInput!) {\n    createCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetCharacterDetails($id: ID!) {\n    character(id: $id) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      skillPoints\n      copper\n      silver\n      gold\n      platinum\n      bankCopper\n      bankSilver\n      bankGold\n      bankPlatinum\n      description\n      title\n      currentRoom\n      saveRoom\n      homeRoom\n      hunger\n      thirst\n      hitRoll\n      damageRoll\n      armorClass\n      playerFlags\n      effectFlags\n      privilegeFlags\n      invisLevel\n      birthTime\n      items {\n        id\n        equippedLocation\n        condition\n        charges\n        objectPrototype {\n          id\n          name\n          type\n        }\n      }\n      effects {\n        id\n        effectName\n        effectType\n        duration\n        strength\n        appliedAt\n        expiresAt\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterDetails($id: ID!) {\n    character(id: $id) {\n      id\n      name\n      level\n      raceType\n      playerClass\n      lastLogin\n      isOnline\n      timePlayed\n      hitPoints\n      hitPointsMax\n      movement\n      movementMax\n      alignment\n      strength\n      intelligence\n      wisdom\n      dexterity\n      constitution\n      charisma\n      luck\n      experience\n      skillPoints\n      copper\n      silver\n      gold\n      platinum\n      bankCopper\n      bankSilver\n      bankGold\n      bankPlatinum\n      description\n      title\n      currentRoom\n      saveRoom\n      homeRoom\n      hunger\n      thirst\n      hitRoll\n      damageRoll\n      armorClass\n      playerFlags\n      effectFlags\n      privilegeFlags\n      invisLevel\n      birthTime\n      items {\n        id\n        equippedLocation\n        condition\n        charges\n        objectPrototype {\n          id\n          name\n          type\n        }\n      }\n      effects {\n        id\n        effectName\n        effectType\n        duration\n        strength\n        appliedAt\n        expiresAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetCharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetCharacterLinkingInfo($characterName: String!) {\n    characterLinkingInfo(characterName: $characterName) {\n      id\n      name\n      level\n      race\n      class\n      lastLogin\n      timePlayed\n      isOnline\n      isLinked\n      hasPassword\n    }\n  }\n"): (typeof documents)["\n  query GetCharacterLinkingInfo($characterName: String!) {\n    characterLinkingInfo(characterName: $characterName) {\n      id\n      name\n      level\n      race\n      class\n      lastLogin\n      timePlayed\n      isOnline\n      isLinked\n      hasPassword\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation LinkCharacter($data: LinkCharacterInput!) {\n    linkCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n    }\n  }\n"): (typeof documents)["\n  mutation LinkCharacter($data: LinkCharacterInput!) {\n    linkCharacter(data: $data) {\n      id\n      name\n      level\n      raceType\n      playerClass\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query ValidateCharacterPassword($characterName: String!, $password: String!) {\n    validateCharacterPassword(\n      characterName: $characterName\n      password: $password\n    )\n  }\n"): (typeof documents)["\n  query ValidateCharacterPassword($characterName: String!, $password: String!) {\n    validateCharacterPassword(\n      characterName: $characterName\n      password: $password\n    )\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetEquipmentSets {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n          keywords\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetEquipmentSets {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      updatedAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n          keywords\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetObjectsForEquipmentSet($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n"): (typeof documents)["\n  query GetObjectsForEquipmentSet($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateEquipmentSet($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateEquipmentSet($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateEquipmentSet($id: ID!, $data: UpdateEquipmentSetInput!) {\n    updateEquipmentSet(id: $id, data: $data) {\n      id\n      name\n      description\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateEquipmentSet($id: ID!, $data: UpdateEquipmentSetInput!) {\n    updateEquipmentSet(id: $id, data: $data) {\n      id\n      name\n      description\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteEquipmentSet($id: ID!) {\n    deleteEquipmentSet(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteEquipmentSet($id: ID!) {\n    deleteEquipmentSet(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddEquipmentSetItem($data: CreateEquipmentSetItemStandaloneInput!) {\n    createEquipmentSetItem(data: $data) {\n      id\n      slot\n      probability\n    }\n  }\n"): (typeof documents)["\n  mutation AddEquipmentSetItem($data: CreateEquipmentSetItemStandaloneInput!) {\n    createEquipmentSetItem(data: $data) {\n      id\n      slot\n      probability\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveEquipmentSetItem($id: ID!) {\n    deleteEquipmentSetItem(id: $id)\n  }\n"): (typeof documents)["\n  mutation RemoveEquipmentSetItem($id: ID!) {\n    deleteEquipmentSetItem(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMobResetsLegacy($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMobResetsLegacy($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetObjectsLegacy($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n"): (typeof documents)["\n  query GetObjectsLegacy($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateMobReset($data: CreateMobResetInput!) {\n    createMobReset(data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n"): (typeof documents)["\n  mutation CreateMobReset($data: CreateMobResetInput!) {\n    createMobReset(data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateMobReset($id: ID!, $data: UpdateMobResetInput!) {\n    updateMobReset(id: $id, data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateMobReset($id: ID!, $data: UpdateMobResetInput!) {\n    updateMobReset(id: $id, data: $data) {\n      id\n      maxInstances\n      probability\n      roomId\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteMobReset($id: ID!) {\n    deleteMobReset(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteMobReset($id: ID!) {\n    deleteMobReset(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteMobResetEquipment($id: ID!) {\n    deleteMobResetEquipment(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteMobResetEquipment($id: ID!) {\n    deleteMobResetEquipment(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMobResetsForMob($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetMobResetsForMob($mobId: Int!, $mobZoneId: Int!) {\n    mobResets(mobId: $mobId, mobZoneId: $mobZoneId) {\n      id\n      maxInstances\n      probability\n      roomId\n      roomZoneId\n      mob {\n        id\n        name\n      }\n      equipment {\n        id\n        maxInstances\n        probability\n        wearLocation\n        objectId\n        objectZoneId\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetEquipmentSetsForMob {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetEquipmentSetsForMob {\n    equipmentSets {\n      id\n      name\n      description\n      createdAt\n      items {\n        id\n        slot\n        probability\n        object {\n          id\n          name\n          type\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetObjectsForMob($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n"): (typeof documents)["\n  query GetObjectsForMob($skip: Int, $take: Int) {\n    objects(skip: $skip, take: $take) {\n      id\n      name\n      type\n      keywords\n      wearFlags\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateEquipmentSetForMob($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  mutation CreateEquipmentSetForMob($data: CreateEquipmentSetInput!) {\n    createEquipmentSet(data: $data) {\n      id\n      name\n      description\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddMobEquipmentSet($data: CreateMobEquipmentSetInput!) {\n    createMobEquipmentSet(data: $data) {\n      id\n      probability\n    }\n  }\n"): (typeof documents)["\n  mutation AddMobEquipmentSet($data: CreateMobEquipmentSetInput!) {\n    createMobEquipmentSet(data: $data) {\n      id\n      probability\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveMobEquipmentSet($id: ID!) {\n    deleteMobEquipmentSet(id: $id)\n  }\n"): (typeof documents)["\n  mutation RemoveMobEquipmentSet($id: ID!) {\n    deleteMobEquipmentSet(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        username\n        email\n        role\n        createdAt\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Me {\n    me {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n"): (typeof documents)["\n  query Me {\n    me {\n      id\n      username\n      email\n      role\n      createdAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "mutation UpdateMob($zoneId: Int!, $id: Int!, $data: UpdateMobInput!) {\n  updateMob(zoneId: $zoneId, id: $id, data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation CreateMob($data: CreateMobInput!) {\n  createMob(data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation DeleteMob($zoneId: Int!, $id: Int!) {\n  deleteMob(zoneId: $zoneId, id: $id) {\n    id\n    zoneId\n  }\n}"): (typeof documents)["mutation UpdateMob($zoneId: Int!, $id: Int!, $data: UpdateMobInput!) {\n  updateMob(zoneId: $zoneId, id: $id, data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation CreateMob($data: CreateMobInput!) {\n  createMob(data: $data) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n  }\n}\n\nmutation DeleteMob($zoneId: Int!, $id: Int!) {\n  deleteMob(zoneId: $zoneId, id: $id) {\n    id\n    zoneId\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "query GetMob($id: Int!, $zoneId: Int!) {\n  mob(id: $id, zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n    createdAt\n    updatedAt\n  }\n}\n\nquery GetMobs($skip: Int, $take: Int) {\n  mobs(skip: $skip, take: $take) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    lifeForce\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n  }\n}\n\nquery GetMobsByZone($zoneId: Int!) {\n  mobsByZone(zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    wealth\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n    lifeForce\n  }\n}"): (typeof documents)["query GetMob($id: Int!, $zoneId: Int!) {\n  mob(id: $id, zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    hitRoll\n    armorClass\n    hpDice\n    damageDice\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    perception\n    concealment\n    race\n    gender\n    size\n    lifeForce\n    composition\n    mobFlags\n    effectFlags\n    position\n    stance\n    createdAt\n    updatedAt\n  }\n}\n\nquery GetMobs($skip: Int, $take: Int) {\n  mobs(skip: $skip, take: $take) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    lifeForce\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n  }\n}\n\nquery GetMobsByZone($zoneId: Int!) {\n  mobsByZone(zoneId: $zoneId) {\n    id\n    zoneId\n    keywords\n    name\n    roomDescription\n    examineDescription\n    level\n    alignment\n    race\n    hitRoll\n    armorClass\n    damageType\n    strength\n    intelligence\n    wisdom\n    dexterity\n    constitution\n    charisma\n    wealth\n    hpDice\n    damageDice\n    mobFlags\n    effectFlags\n    lifeForce\n  }\n}"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query OnlineCharacters($userId: ID) {\n    onlineCharacters(userId: $userId) {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n"): (typeof documents)["\n  query OnlineCharacters($userId: ID) {\n    onlineCharacters(userId: $userId) {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyOnlineCharacters {\n    myOnlineCharacters {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n"): (typeof documents)["\n  query MyOnlineCharacters {\n    myOnlineCharacters {\n      id\n      name\n      level\n      lastLogin\n      isOnline\n      raceType\n      playerClass\n      user {\n        id\n        username\n        role\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query CharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n"): (typeof documents)["\n  query CharacterSessionInfo($characterId: ID!) {\n    characterSessionInfo(characterId: $characterId) {\n      id\n      name\n      isOnline\n      lastLogin\n      totalTimePlayed\n      currentSessionTime\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SetCharacterOnline($characterId: ID!) {\n    setCharacterOnline(characterId: $characterId)\n  }\n"): (typeof documents)["\n  mutation SetCharacterOnline($characterId: ID!) {\n    setCharacterOnline(characterId: $characterId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation SetCharacterOffline($characterId: ID!) {\n    setCharacterOffline(characterId: $characterId)\n  }\n"): (typeof documents)["\n  mutation SetCharacterOffline($characterId: ID!) {\n    setCharacterOffline(characterId: $characterId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateCharacterActivity($characterId: ID!) {\n    updateCharacterActivity(characterId: $characterId)\n  }\n"): (typeof documents)["\n  mutation UpdateCharacterActivity($characterId: ID!) {\n    updateCharacterActivity(characterId: $characterId)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query MyPermissions {\n    myPermissions {\n      isPlayer\n      isImmortal\n      isBuilder\n      isCoder\n      isGod\n      canAccessDashboard\n      canManageUsers\n      canViewValidation\n      maxCharacterLevel\n      role\n    }\n  }\n"): (typeof documents)["\n  query MyPermissions {\n    myPermissions {\n      isPlayer\n      isImmortal\n      isBuilder\n      isCoder\n      isGod\n      canAccessDashboard\n      canManageUsers\n      canViewValidation\n      maxCharacterLevel\n      role\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;