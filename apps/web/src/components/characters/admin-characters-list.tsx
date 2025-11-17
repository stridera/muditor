'use client';

import { CharacterCard } from '@/components/characters/character-card';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { Filter, Loader2, Search, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const GET_ALL_CHARACTERS = gql`
  query GetAllCharactersInline(
    $skip: Int
    $take: Int
    $filter: CharacterFilterInput
  ) {
    characters(skip: $skip, take: $take, filter: $filter) {
      id
      name
      level
      raceType
      playerClass
      lastLogin
      isOnline
      timePlayed
      hitPoints
      hitPointsMax
      movement
      movementMax
      alignment
      strength
      intelligence
      wisdom
      dexterity
      constitution
      charisma
      luck
      experience
      copper
      silver
      gold
      platinum
      description
      title
      currentRoom
    }
  }
`;

const GET_CHARACTERS_COUNT = gql`
  query GetCharactersCountInline($filter: CharacterFilterInput) {
    charactersCount(filter: $filter)
  }
`;

interface AdminCharactersListProps {
  onCharacterClick?: (characterId: string) => void;
}

interface Character {
  id: string;
  name: string;
  level: number;
  raceType?: string;
  playerClass?: string;
  lastLogin?: string;
  isOnline: boolean;
  timePlayed: number;
  hitPoints: number;
  hitPointsMax: number;
  movement: number;
  movementMax: number;
  alignment: number;
  strength: number;
  intelligence: number;
  wisdom: number;
  dexterity: number;
  constitution: number;
  charisma: number;
  luck: number;
  experience: number;
  copper: number;
  silver: number;
  gold: number;
  platinum: number;
  description?: string;
  title?: string;
  currentRoom?: number;
}

interface GetAllCharactersQueryResult {
  characters: Character[];
}

interface GetCharactersCountQueryResult {
  charactersCount: number;
}

export function AdminCharactersList({
  onCharacterClick,
}: AdminCharactersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRace, setFilterRace] = useState<string>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const charactersPerPage = 12;

  // Build filter object for GraphQL query
  const buildFilter = () => {
    const filter: any = {};
    if (searchTerm) filter.name = searchTerm;
    if (filterRace !== 'all') filter.raceType = filterRace;
    if (filterClass !== 'all') filter.playerClass = filterClass;
    if (filterStatus === 'online') filter.isOnline = true;
    if (filterStatus === 'offline') filter.isOnline = false;
    return Object.keys(filter).length > 0 ? filter : undefined;
  };

  const currentFilter = buildFilter();

  const { data: countData } = useQuery<GetCharactersCountQueryResult>(
    GET_CHARACTERS_COUNT,
    {
      variables: { filter: currentFilter },
    }
  );
  const totalCharacters = countData?.charactersCount || 0;

  const { data, loading, error, refetch } =
    useQuery<GetAllCharactersQueryResult>(GET_ALL_CHARACTERS, {
      variables: {
        skip: (currentPage - 1) * charactersPerPage,
        take: charactersPerPage,
        filter: currentFilter,
      },
      pollInterval: 30000,
    });

  const characters = data?.characters || [];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRace, filterClass, filterStatus]);

  const totalPages = Math.ceil(totalCharacters / charactersPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRace('all');
    setFilterClass('all');
    setFilterStatus('all');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    filterRace !== 'all' ||
    filterClass !== 'all' ||
    filterStatus !== 'all';

  const races = [
    { value: 'all', label: 'All Races' },
    { value: 'human', label: 'Human' },
    { value: 'elf', label: 'Elf' },
    { value: 'dwarf', label: 'Dwarf' },
    { value: 'halfling', label: 'Halfling' },
    { value: 'gnome', label: 'Gnome' },
    { value: 'half-elf', label: 'Half-Elf' },
    { value: 'orc', label: 'Orc' },
    { value: 'troll', label: 'Troll' },
  ];

  const classes = [
    { value: 'all', label: 'All Classes' },
    { value: 'fighter', label: 'Fighter' },
    { value: 'cleric', label: 'Cleric' },
    { value: 'magic-user', label: 'Magic User' },
    { value: 'thief', label: 'Thief' },
    { value: 'ranger', label: 'Ranger' },
    { value: 'paladin', label: 'Paladin' },
    { value: 'barbarian', label: 'Barbarian' },
    { value: 'sorcerer', label: 'Sorcerer' },
  ];

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold flex items-center gap-2'>
            <Users className='h-6 w-6' />
            All Characters
          </h2>
          <p className='text-muted-foreground'>
            {characters.length} of {totalCharacters} characters
            {hasActiveFilters && ' (filtered)'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant='outline'>
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            Search & Filter
          </CardTitle>
          <CardDescription>
            Find specific characters by name, race, class, or status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Search by name */}
            <div className='space-y-2'>
              <Label htmlFor='search'>Search Name</Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  id='search'
                  placeholder='Character name...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Filter by race */}
            <div className='space-y-2'>
              <Label htmlFor='race'>Race</Label>
              <Select value={filterRace} onValueChange={setFilterRace}>
                <SelectTrigger id='race'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {races.map(race => (
                    <SelectItem key={race.value} value={race.value}>
                      {race.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter by class */}
            <div className='space-y-2'>
              <Label htmlFor='class'>Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger id='class'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter by online status */}
            <div className='space-y-2'>
              <Label htmlFor='status'>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id='status'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='online'>Online</SelectItem>
                  <SelectItem value='offline'>Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className='mt-4 flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                {totalCharacters} characters match your filters
              </p>
              <Button
                variant='ghost'
                size='sm'
                onClick={clearFilters}
                className='h-8'
              >
                <X className='h-4 w-4 mr-2' />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Character Grid */}
      {loading && characters.length === 0 ? (
        <div className='flex items-center justify-center p-12'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p className='text-muted-foreground'>Loading characters...</p>
          </div>
        </div>
      ) : error ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <p className='text-muted-foreground mb-4'>
              Failed to load characters: {error.message}
            </p>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardContent>
        </Card>
      ) : characters.length === 0 ? (
        <Card>
          <CardContent className='p-12 text-center'>
            <p className='text-muted-foreground mb-4'>
              {hasActiveFilters
                ? 'No characters match your search criteria'
                : 'No characters found in the system'}
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} variant='outline'>
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {characters.map(character => (
              <CharacterCard
                key={character.id}
                character={character}
                showFullDetails={true}
                onCharacterClick={onCharacterClick ?? (() => {})}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-2'>
              <Button
                variant='outline'
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <div className='flex items-center gap-2'>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      size='sm'
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className='text-muted-foreground'>...</span>
                    <Button
                      variant={
                        currentPage === totalPages ? 'default' : 'outline'
                      }
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={loading}
                      size='sm'
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              <Button
                variant='outline'
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
