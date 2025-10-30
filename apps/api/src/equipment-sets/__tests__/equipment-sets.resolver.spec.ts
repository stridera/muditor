import { Test, TestingModule } from '@nestjs/testing';
import { EquipmentSetsResolver } from '../equipment-sets.resolver';
import { EquipmentSetsService } from '../equipment-sets.service';
import { CreateEquipmentSetInput, CreateEquipmentSetItemStandaloneInput } from '../equipment-set.dto';

describe('EquipmentSetsResolver', () => {
  let resolver: EquipmentSetsResolver;
  let service: EquipmentSetsService;

  const mockEquipmentSetsService = {
    findAll: jest.fn(),
    create: jest.fn(),
    createEquipmentSetItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipmentSetsResolver,
        {
          provide: EquipmentSetsService,
          useValue: mockEquipmentSetsService,
        },
      ],
    }).compile();

    resolver = module.get<EquipmentSetsResolver>(EquipmentSetsResolver);
    service = module.get<EquipmentSetsService>(EquipmentSetsService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('equipmentSets', () => {
    it('should return array of equipment sets', async () => {
      const expectedResult = [
        {
          id: 'test-id',
          name: 'Test Equipment Set',
          description: 'Test set',
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      mockEquipmentSetsService.findAll.mockResolvedValue(expectedResult);

      const result = await resolver.findAll();
      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('createEquipmentSet', () => {
    it('should create equipment set successfully', async () => {
      const input: CreateEquipmentSetInput = {
        name: 'Test Equipment Set',
        description: 'Test description',
        items: [
          {
            objectId: 1,
            slot: 'wield',
            quantity: 1,
            probability: 1.0,
          },
        ],
      };

      const expectedResult = {
        id: 'test-id',
        name: input.name,
        description: input.description,
        items: [
          {
            id: 'item-id',
            objectId: 1,
            slot: 'wield',
            quantity: 1,
            probability: 1.0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockEquipmentSetsService.create.mockResolvedValue(expectedResult);

      const result = await resolver.createEquipmentSet(input);
      expect(result).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(input);
    });
  });

  describe('createEquipmentSetItem', () => {
    it('should create equipment set item successfully', async () => {
      const input: CreateEquipmentSetItemStandaloneInput = {
        equipmentSetId: 'set-id',
        objectId: 1,
        slot: 'wear',
        quantity: 2,
        probability: 0.8,
      };

      const expectedResult = {
        id: 'item-id',
        objectId: 1,
        slot: 'wear',
        quantity: 2,
        probability: 0.8,
      };

      mockEquipmentSetsService.createEquipmentSetItem.mockResolvedValue(expectedResult);

      const result = await resolver.createEquipmentSetItem(input);
      expect(result).toBe(expectedResult);
      expect(service.createEquipmentSetItem).toHaveBeenCalledWith(input);
    });
  });
});