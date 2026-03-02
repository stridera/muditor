declare module 'luaparse' {
  interface NodeBase {
    type: string;
    loc?: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    };
  }

  interface Chunk extends NodeBase {
    type: 'Chunk';
    body: Statement[];
  }

  interface Identifier extends NodeBase {
    type: 'Identifier';
    name: string;
  }

  interface StringLiteral extends NodeBase {
    type: 'StringLiteral';
    value: string;
    raw: string;
  }

  interface NumericLiteral extends NodeBase {
    type: 'NumericLiteral';
    value: number;
    raw: string;
  }

  interface BooleanLiteral extends NodeBase {
    type: 'BooleanLiteral';
    value: boolean;
    raw: string;
  }

  interface NilLiteral extends NodeBase {
    type: 'NilLiteral';
    value: null;
    raw: string;
  }

  interface VarargLiteral extends NodeBase {
    type: 'VarargLiteral';
    value: string;
    raw: string;
  }

  interface MemberExpression extends NodeBase {
    type: 'MemberExpression';
    indexer: '.' | ':';
    identifier: Identifier;
    base: Expression;
  }

  interface IndexExpression extends NodeBase {
    type: 'IndexExpression';
    base: Expression;
    index: Expression;
  }

  interface CallExpression extends NodeBase {
    type: 'CallExpression';
    base: Expression;
    arguments: Expression[];
  }

  interface StringCallExpression extends NodeBase {
    type: 'StringCallExpression';
    base: Expression;
    argument: StringLiteral;
  }

  interface TableCallExpression extends NodeBase {
    type: 'TableCallExpression';
    base: Expression;
    arguments: Expression;
  }

  interface UnaryExpression extends NodeBase {
    type: 'UnaryExpression';
    operator: string;
    argument: Expression;
  }

  interface BinaryExpression extends NodeBase {
    type: 'BinaryExpression';
    operator: string;
    left: Expression;
    right: Expression;
  }

  interface LogicalExpression extends NodeBase {
    type: 'LogicalExpression';
    operator: string;
    left: Expression;
    right: Expression;
  }

  interface TableConstructorExpression extends NodeBase {
    type: 'TableConstructorExpression';
    fields: (TableKey | TableKeyString | TableValue)[];
  }

  interface TableKey extends NodeBase {
    type: 'TableKey';
    key: Expression;
    value: Expression;
  }

  interface TableKeyString extends NodeBase {
    type: 'TableKeyString';
    key: Identifier;
    value: Expression;
  }

  interface TableValue extends NodeBase {
    type: 'TableValue';
    value: Expression;
  }

  interface FunctionDeclaration extends NodeBase {
    type: 'FunctionDeclaration';
    identifier: Identifier | MemberExpression | null;
    isLocal: boolean;
    parameters: (Identifier | VarargLiteral)[];
    body: Statement[];
  }

  interface LocalStatement extends NodeBase {
    type: 'LocalStatement';
    variables: Identifier[];
    init: Expression[];
  }

  interface AssignmentStatement extends NodeBase {
    type: 'AssignmentStatement';
    variables: Expression[];
    init: Expression[];
  }

  interface CallStatement extends NodeBase {
    type: 'CallStatement';
    expression: CallExpression | StringCallExpression | TableCallExpression;
  }

  interface ReturnStatement extends NodeBase {
    type: 'ReturnStatement';
    arguments: Expression[];
  }

  interface BreakStatement extends NodeBase {
    type: 'BreakStatement';
  }

  interface GotoStatement extends NodeBase {
    type: 'GotoStatement';
    label: Identifier;
  }

  interface LabelStatement extends NodeBase {
    type: 'LabelStatement';
    label: Identifier;
  }

  interface IfStatement extends NodeBase {
    type: 'IfStatement';
    clauses: (IfClause | ElseifClause | ElseClause)[];
  }

  interface IfClause extends NodeBase {
    type: 'IfClause';
    condition: Expression;
    body: Statement[];
  }

  interface ElseifClause extends NodeBase {
    type: 'ElseifClause';
    condition: Expression;
    body: Statement[];
  }

  interface ElseClause extends NodeBase {
    type: 'ElseClause';
    body: Statement[];
  }

  interface WhileStatement extends NodeBase {
    type: 'WhileStatement';
    condition: Expression;
    body: Statement[];
  }

  interface RepeatStatement extends NodeBase {
    type: 'RepeatStatement';
    condition: Expression;
    body: Statement[];
  }

  interface DoStatement extends NodeBase {
    type: 'DoStatement';
    body: Statement[];
  }

  interface ForNumericStatement extends NodeBase {
    type: 'ForNumericStatement';
    variable: Identifier;
    start: Expression;
    end: Expression;
    step: Expression | null;
    body: Statement[];
  }

  interface ForGenericStatement extends NodeBase {
    type: 'ForGenericStatement';
    variables: Identifier[];
    iterators: Expression[];
    body: Statement[];
  }

  type Statement =
    | LocalStatement
    | AssignmentStatement
    | CallStatement
    | ReturnStatement
    | BreakStatement
    | GotoStatement
    | LabelStatement
    | IfStatement
    | WhileStatement
    | RepeatStatement
    | DoStatement
    | ForNumericStatement
    | ForGenericStatement
    | FunctionDeclaration;

  type Expression =
    | Identifier
    | StringLiteral
    | NumericLiteral
    | BooleanLiteral
    | NilLiteral
    | VarargLiteral
    | MemberExpression
    | IndexExpression
    | CallExpression
    | StringCallExpression
    | TableCallExpression
    | UnaryExpression
    | BinaryExpression
    | LogicalExpression
    | TableConstructorExpression
    | FunctionDeclaration;

  type Node =
    | Statement
    | Expression
    | Chunk
    | IfClause
    | ElseifClause
    | ElseClause
    | TableKey
    | TableKeyString
    | TableValue;

  interface ParseOptions {
    /** Store location info on each syntax node */
    locations?: boolean;
    /** Store the start and end character locations */
    ranges?: boolean;
    /** Track comments as an array */
    comments?: boolean;
    /** Accept Lua 5.1 code */
    luaVersion?: '5.1' | '5.2' | '5.3';
    /** Wait for manually invoking parser functions (advanced) */
    wait?: boolean;
    /** Called when errors are encountered */
    onCreateNode?: (node: Node) => void;
  }

  function parse(code: string, options?: ParseOptions): Chunk;
}
