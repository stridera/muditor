'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface FormulaHelpDialogProps {
  trigger?: React.ReactNode;
}

export function FormulaHelpDialog({ trigger }: FormulaHelpDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant='ghost' size='sm' className='gap-1'>
            <HelpCircle className='h-4 w-4' />
            Formula Help
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[80vh]'>
        <DialogHeader>
          <DialogTitle>Formula Reference</DialogTitle>
          <DialogDescription>
            Use these variables and syntax in formula fields
          </DialogDescription>
        </DialogHeader>
        <div className='h-[60vh] overflow-y-auto pr-4'>
          <div className='space-y-6'>
            {/* Dice Notation */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Dice Notation
              </h3>
              <div className='bg-muted rounded-md p-3 font-mono text-sm space-y-1'>
                <div>
                  <span className='text-blue-500'>1d6</span> - Roll one 6-sided
                  die
                </div>
                <div>
                  <span className='text-blue-500'>2d8</span> - Roll two 8-sided
                  dice
                </div>
                <div>
                  <span className='text-blue-500'>3d6+5</span> - Roll 3d6 and
                  add 5
                </div>
                <div>
                  <span className='text-blue-500'>1d20-2</span> - Roll 1d20 and
                  subtract 2
                </div>
              </div>
            </section>

            {/* Character Stats */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Character Stats
              </h3>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-xs text-muted-foreground mb-1'>
                    Attributes
                  </div>
                  <div className='font-mono space-y-0.5'>
                    <div>
                      <span className='text-green-500'>str</span> - Strength
                    </div>
                    <div>
                      <span className='text-green-500'>dex</span> - Dexterity
                    </div>
                    <div>
                      <span className='text-green-500'>con</span> - Constitution
                    </div>
                    <div>
                      <span className='text-green-500'>int</span> - Intelligence
                    </div>
                    <div>
                      <span className='text-green-500'>wis</span> - Wisdom
                    </div>
                    <div>
                      <span className='text-green-500'>cha</span> - Charisma
                    </div>
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-xs text-muted-foreground mb-1'>
                    Combat Stats
                  </div>
                  <div className='font-mono space-y-0.5'>
                    <div>
                      <span className='text-green-500'>level</span> - Character
                      level
                    </div>
                    <div>
                      <span className='text-green-500'>acc</span> - Accuracy
                    </div>
                    <div>
                      <span className='text-green-500'>damroll</span> - Damage
                      bonus
                    </div>
                    <div>
                      <span className='text-green-500'>eva</span> - Evasion
                    </div>
                    <div>
                      <span className='text-green-500'>ward</span> - Ward
                    </div>
                    <div>
                      <span className='text-green-500'>focus</span> - Focus
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Caster/Target Variables */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Caster &amp; Target
              </h3>
              <div className='grid grid-cols-2 gap-2 text-sm'>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-xs text-muted-foreground mb-1'>
                    Caster (self)
                  </div>
                  <div className='font-mono space-y-0.5'>
                    <div>
                      <span className='text-purple-500'>caster.level</span>
                    </div>
                    <div>
                      <span className='text-purple-500'>caster.hp</span>
                    </div>
                    <div>
                      <span className='text-purple-500'>caster.maxhp</span>
                    </div>
                    <div>
                      <span className='text-purple-500'>caster.str</span>
                    </div>
                    <div>
                      <span className='text-purple-500'>caster.class</span>
                    </div>
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-xs text-muted-foreground mb-1'>
                    Target
                  </div>
                  <div className='font-mono space-y-0.5'>
                    <div>
                      <span className='text-orange-500'>target.level</span>
                    </div>
                    <div>
                      <span className='text-orange-500'>target.hp</span>
                    </div>
                    <div>
                      <span className='text-orange-500'>target.maxhp</span>
                    </div>
                    <div>
                      <span className='text-orange-500'>target.str</span>
                    </div>
                    <div>
                      <span className='text-orange-500'>target.isUndead</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Skill Variables */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Skill &amp; Spell
              </h3>
              <div className='bg-muted rounded-md p-3 font-mono text-sm space-y-1'>
                <div>
                  <span className='text-yellow-500'>skill</span> - Caster&apos;s
                  proficiency in this ability (0-100)
                  <div className='text-muted-foreground text-xs ml-4'>
                    e.g., if using &quot;fireball&quot;, this is the fireball
                    skill %
                  </div>
                </div>
                <div>
                  <span className='text-yellow-500'>spell_level</span> - Spell
                  slot level used for casting
                </div>
                <div>
                  <span className='text-yellow-500'>circle</span> - Spell circle
                  (1-9)
                </div>
              </div>
            </section>

            {/* Operators */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Operators
              </h3>
              <div className='bg-muted rounded-md p-3 font-mono text-sm'>
                <div className='grid grid-cols-4 gap-2'>
                  <div>
                    <span className='text-red-500'>+</span> Add
                  </div>
                  <div>
                    <span className='text-red-500'>-</span> Subtract
                  </div>
                  <div>
                    <span className='text-red-500'>*</span> Multiply
                  </div>
                  <div>
                    <span className='text-red-500'>/</span> Divide
                  </div>
                  <div>
                    <span className='text-red-500'>%</span> Modulo
                  </div>
                  <div>
                    <span className='text-red-500'>()</span> Group
                  </div>
                  <div>
                    <span className='text-red-500'>min()</span> Minimum
                  </div>
                  <div>
                    <span className='text-red-500'>max()</span> Maximum
                  </div>
                </div>
              </div>
            </section>

            {/* Example Formulas */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Example Formulas
              </h3>
              <div className='space-y-2 text-sm'>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>1d6 + level</div>
                  <div className='text-muted-foreground text-xs'>
                    Basic damage scaling with level
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>2d8 + str / 2</div>
                  <div className='text-muted-foreground text-xs'>
                    Strength-based attack
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>skill / 5 + wis</div>
                  <div className='text-muted-foreground text-xs'>
                    Skill proficiency bonus
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>
                    max(1, level / 4) * 1d6
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Scaling dice with minimum
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>
                    target.maxhp * 0.1
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Percentage of target max HP
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>
                    (caster.level - target.level) * 2
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Level difference scaling
                  </div>
                </div>
              </div>
            </section>

            {/* Gates (Conditionals) */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Gates (Conditional Blocks)
              </h3>
              <div className='text-sm text-muted-foreground mb-2'>
                Gates control which effects execute based on conditions
              </div>
              <div className='space-y-2 text-sm'>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-cyan-500'>
                    If (Condition Check)
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Execute effects based on a Lua expression
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-cyan-500'>Chance</div>
                  <div className='text-muted-foreground text-xs'>
                    Random % chance to execute (e.g., 25% proc rate)
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-cyan-500'>
                    Saving Throw
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Target rolls save vs DC - pass/fail branches
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-cyan-500'>Attack Roll</div>
                  <div className='text-muted-foreground text-xs'>
                    Roll to hit - determines hit/miss effects
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-semibold text-cyan-500'>Contest</div>
                  <div className='text-muted-foreground text-xs'>
                    Opposed stat check (e.g., STR vs STR)
                  </div>
                </div>
              </div>
            </section>

            {/* Conditions (Lua) */}
            <section>
              <h3 className='font-semibold text-sm mb-2 text-primary'>
                Conditions (Lua)
              </h3>
              <div className='text-sm text-muted-foreground mb-2'>
                Condition fields use Lua expressions that return true/false
              </div>
              <div className='space-y-2 text-sm'>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>target.isUndead</div>
                  <div className='text-muted-foreground text-xs'>
                    Only affects undead targets
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>
                    caster.hp &lt; caster.maxhp / 2
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Caster is below 50% HP
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>
                    target.level &lt;= caster.level + 5
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Target within 5 levels
                  </div>
                </div>
                <div className='bg-muted rounded-md p-2'>
                  <div className='font-mono text-blue-500'>
                    not target.hasEffect("sanctuary")
                  </div>
                  <div className='text-muted-foreground text-xs'>
                    Target not protected
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FormulaHelpDialog;
