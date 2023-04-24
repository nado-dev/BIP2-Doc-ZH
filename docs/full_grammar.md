> 原文[BIP 2 Grammar](https://www-verimag.imag.fr/TOOLS/DCS/bip/doc/latest/html/Bip2-simplified.html)

# BIP2完整语法

完整的语法是使用 `antlr ` 语法给出的。为了可读性， `Java ` 代码和一些头部已经省略。

```antlr
grammar Bip2;

CT_INT  :   'int';
CT_BOOL :   'bool';
CT_FLOAT:   'float';
CT_STRING:   'string';

TRUE : 'true';
FALSE : 'false';
REFINE : 'refine';
EXTERN  : 'extern';
EXPORT  :   'export';
FUNCTION :   'function';
OPERATOR :   'operator';
DEFINE  :   'define';
DATA    :   'data';
PACKAGE :   'package';
END :   'end';
USE :   'use';
AS  :   'as';
ATOM    :   'atom';
COMPOUND:   'compound';
COMPONENT
    :   'component';
ON  :   'on';
INTERNAL        :                     'internal';
DO  :   'do';
PROVIDED:   'provided';
INITIAL :   'initial';
PLACE   :   'place';
FROM    :   'from';
TO  :   'to';
PRIORITY:   'priority';
CONNECTOR
    :   'connector';
UP_ACTION   :   'up';
DOWN_ACTION :   'down';
PORT    :   'port';
TYPE    :   'type';
CONST   :   'const';
LPAREN  :   '(';
RPAREN  :   ')';
LBRACE  :   '{';
RBRACE  :   '}';
COMMA   :   ',';
QUOTE   :   '\'';
DOT     :   '.';
SEMICOL :   ';';
COLON   :   ':';
AT      :   '@';

IF : 'if';
THEN : 'then';
ELSE : 'else';
FI : 'fi';


ID  :   ('a'..'z'|'A'..'Z'|'_') ('a'..'z'|'A'..'Z'|'0'..'9'|'_')*
    ;

INT :   '0'..'9'+
    ;

FLOAT
    :   ('0'..'9')+ DOT ('0'..'9')* EXPONENT?
    |   DOT ('0'..'9')+ EXPONENT?
    |   ('0'..'9')+ EXPONENT
    ;

COMMENT
    :   '//' ~('\n'|'\r')* '\r'? '\n' {$channel=HIDDEN;}
    |   '/*' ( options {greedy=false;} : . )* '*/' {$channel=HIDDEN;}
    ;

WS  :   ( ' '
        | '\t'
        | '\r'
        | '\n'
        ) {$channel=HIDDEN;}
    ;

STRING
    :  '"' ( ESC_SEQ | ~('\\'|'"') )* '"'
    ;

fragment
EXPONENT : ('e'|'E') ('+'|'-')? ('0'..'9')+ ;

fragment
HEX_DIGIT : ('0'..'9'|'a'..'f'|'A'..'F') ;

fragment
ESC_SEQ
    :   '\\' ('b'|'t'|'n'|'f'|'r'|'\"'|'\''|'\\')
    |   UNICODE_ESC
    |   OCTAL_ESC
    ;

fragment
OCTAL_ESC
    :   '\\' ('0'..'3') ('0'..'7') ('0'..'7')
    |   '\\' ('0'..'7') ('0'..'7')
    |   '\\' ('0'..'7')
    ;

fragment
UNICODE_ESC
    :   '\\' 'u' HEX_DIGIT HEX_DIGIT HEX_DIGIT HEX_DIGIT
    ;

LT_OP   :   '<';
GT_OP   :   '>';
LE_OP   :   '<=';
GE_OP   :   '>=';
EQ_OP   :   '==';
NE_OP   :   '!=';
AND_OP  :   '&&';
OR_OP   :   '||';
NOT_OP  :   '!';

PLUS_OP :   '+';
MINUS_OP:   '-';
MULT_OP :   '*';
DIV_OP  :   '/';
MOD_OP  :   '%';

BWISE_AND_OP : '&';
BWISE_OR_OP : '|';
BWISE_XOR_OP : '^';
BWISE_NOT_OP : '~';

ASSIGN_OP : '=';

binary_operator
    : comparison_operator
    | arithmetic_binary_operator
    | bwise_binary_operator
    | logical_binary_operator
    ;

unary_operator
    : arithmetic_unary_operator
    | bwise_unary_operator
    | logical_unary_operator
    ;

comparison_operator
    : EQ_OP | NE_OP | GT_OP | GE_OP | LT_OP | LE_OP
    ;

arithmetic_binary_operator
    : PLUS_OP | MINUS_OP | MULT_OP | DIV_OP | MOD_OP
    ;

arithmetic_unary_operator
    : PLUS_OP | MINUS_OP
    ;

bwise_binary_operator
    : BWISE_AND_OP | BWISE_OR_OP | BWISE_XOR_OP
    ;

bwise_unary_operator
    : BWISE_NOT_OP
    ;

logical_binary_operator
    : AND_OP | OR_OP
    ;

logical_unary_operator
    : NOT_OP
    ;

fully_qualified_name
    : ID (DOT ID)*
    ;

simple_name
    : ID
    ;

bip_package
    : annotation*
      PACKAGE fully_qualified_name
      (USE fully_qualified_name)*
      annotated_const_data_declaration*
      annotated_extern_data_type*
      annotated_extern_prototype*
      annotated_type_definition*
      END
    ;

annotated_extern_prototype
    : annotated_extern_function_prototype
    | annotated_extern_binary_operator_prototype
    | annotated_extern_unary_operator_prototype
    ;

annotated_extern_data_type
    : annotation* EXTERN DATA TYPE simple_name
      (REFINE data_type_name (COMMA data_type_name)*)?
      (AS STRING)?
    ;

annotated_extern_function_prototype
    : annotation* EXTERN FUNCTION
      data_type_name? simple_name LPAREN data_types_params? RPAREN
    ;

annotated_extern_binary_operator_prototype
    : annotation* EXTERN OPERATOR data_type_name binary_operator
      LPAREN data_type_name COMMA fully_qualified_name RPAREN
    ;

annotated_extern_unary_operator_prototype
    : annotation* EXTERN OPERATOR data_type_name unary_operator
      LPAREN data_type_name RPAREN
    ;


data_types_params
    : data_type_name (COMMA data_type_name)*
    ;

annotated_const_data_declaration
  : annotation*
    CONST DATA  native_data_type_name simple_name ASSIGN_OP logical_or_expression
  ;

places_declaration
    : PLACE simple_name (COMMA simple_name)*
    ;

transition_action
    : LBRACE!  ((statement SEMICOL!)| if_then_else_expression)* RBRACE!
    ;

transition_guard
    : LPAREN logical_or_expression RPAREN
    ;

transition
    :
    annotation*
    (ON simple_name | INTERNAL)
    FROM simple_name (COMMA simple_name)*
    TO   simple_name (COMMA simple_name)*
    (PROVIDED transition_guard)?
    (DO transition_action)?
    ;

compound_interaction
    : simple_name COLON (fully_qualified_name (COMMA fully_qualified_name)*|MULT_OP)
    ;

compound_interaction_wildcard
  : compound_interaction | MULT_OP COLON MULT_OP;

compound_priority_guard
    : LPAREN logical_or_expression RPAREN
    ;

compound_priority_declaration
    : PRIORITY simple_name
      compound_interaction_wildcard LT_OP compound_interaction_wildcard
      (PROVIDED compound_priority_guard)?
    ;



initial_transition
    : INITIAL TO simple_name (COMMA simple_name)* (DO transition_action)?
    ;

comp_type_data_params
    : native_data_type_param (COMMA native_data_type_param)*
    ;

atom_priority_guard
    : LPAREN logical_or_expression RPAREN
    ;

port_name_wildcard
    : simple_name | MULT_OP
    ;

atom_priority_declaration
    : PRIORITY simple_name port_name_wildcard LT_OP port_name_wildcard
      (PROVIDED atom_priority_guard)?
    ;

atom_type_definition
    : ATOM TYPE simple_name
      LPAREN (comp_type_data_params)? RPAREN
      (multi_data_declaration_with_modifiers)*
      (multi_port_declaration_with_modifiers)*
      places_declaration
      initial_transition
      transition+
      atom_priority_declaration*
      END
    ;

fragment_component_declaration
    : simple_name
      LPAREN (logical_or_expression (COMMA logical_or_expression)*)? RPAREN
    ;

multi_component_declaration
    : annotation*
      COMPONENT fully_qualified_name fragment_component_declaration
      (COMMA fragment_component_declaration)*
    ;

fragment_connector_declaration
    : simple_name
      LPAREN fully_qualified_name (COMMA fully_qualified_name)* RPAREN
    ;

multi_connector_declaration
    : CONNECTOR fully_qualified_name fragment_connector_declaration
      (COMMA fragment_connector_declaration)*
    ;

export_inner_port
    : annotation*
      EXPORT PORT fully_qualified_name (COMMA fully_qualified_name)* AS simple_name
    ;

export_inner_data
    : annotation*
      EXPORT DATA fully_qualified_name AS simple_name
    ;


compound_type_definition
    : COMPOUND TYPE simple_name
      LPAREN (comp_type_data_params)? RPAREN
      multi_component_declaration+
      multi_connector_declaration*
      compound_priority_declaration*
      export_inner_port*
      export_inner_data*
      END
    ;

native_data_type_name
    : CT_INT
    | CT_BOOL
    | CT_FLOAT
    | CT_STRING
    ;

data_type_name
    : fully_qualified_name
    | native_data_type_name
    ;

native_data_type_param
    : native_data_type_name simple_name
    ;

any_data_type_param
    : data_type_name simple_name
    ;

multi_data_declaration_with_modifiers
    : annotation*
      EXPORT? multi_data_declaration
    ;

multi_data_declaration
    : DATA data_type_name simple_name (COMMA simple_name)*
    ;


port_type_data_params
    : any_data_type_param (COMMA any_data_type_param)*
    ;

port_type_definition
    : PORT TYPE simple_name
      LPAREN (port_type_data_params)? RPAREN
    ;

port_primary_expression
    : simple_name QUOTE?
    ;

port_nested_expression
    : LPAREN connector_port_expression RPAREN QUOTE?
    ;

connector_port_expression
    : (port_primary_expression | port_nested_expression)+
    ;

port_type_param
    : fully_qualified_name simple_name
    ;

fragment_port_declaration
    : simple_name LPAREN (simple_name (COMMA simple_name)*)? RPAREN
    ;

multi_port_declaration_with_modifiers
    : annotation*
      (EXPORT)? multi_port_declaration (AS simple_name)?
    ;

multi_port_declaration
    : PORT fully_qualified_name fragment_port_declaration
      (COMMA fragment_port_declaration)*
    ;

single_port_declaration
    : PORT fully_qualified_name fragment_port_declaration
    ;

connector_provided_expression
    : LPAREN logical_or_expression RPAREN
    ;

connector_action
    : ((statement SEMICOL!)| if_then_else_expression)+
    ;

connector_interaction
    : annotation*
      ON simple_name+
      (PROVIDED connector_provided_expression)?
      (UP_ACTION LBRACE connector_action? RBRACE)?
      (DOWN_ACTION LBRACE connector_action? RBRACE)?
    ;

connector_type_definition
    : CONNECTOR TYPE simple_name
      LPAREN (port_type_param (COMMA port_type_param)*)  RPAREN
      multi_data_declaration*
      (EXPORT single_port_declaration)?
      DEFINE connector_port_expression
      connector_interaction*
      END
    ;

annotation_param
    : ID (ASSIGN_OP (ID|TRUE|FALSE|STRING))?
    ;


annotation
    : AT ID (LPAREN annotation_param (COMMA annotation_param)* RPAREN)?
    ;

annotated_type_definition
    : annotation* type_definition
    ;

type_definition
     : atom_type_definition
     | compound_type_definition
     | port_type_definition
     | connector_type_definition
     ;

primary_expression
    : fully_qualified_name
    | INT
    | FLOAT
    | STRING
    | TRUE
    | FALSE
    | LPAREN! logical_or_expression RPAREN!
    ;

statement
    : assignment_expression
    | postfix_expression
    ;

if_then_else_expression
    : IF LPAREN logical_or_expression RPAREN
      THEN ((statement SEMICOL)|if_then_else_expression)+
      (ELSE ((statement SEMICOL)|if_then_else_expression)+)?
      FI
    ;

assignment_expression
    : postfix_expression ASSIGN_OP^ logical_or_expression
    ;

logical_or_expression
    : (logical_and_expression)
      (OR_OP logical_or_expression)?
    ;

logical_and_expression
    : (inclusive_or_expression)
      (AND_OP logical_and_expression)?
    ;

inclusive_or_expression
    : (exclusive_or_expression)
      (BWISE_OR_OP inclusive_or_expression)?
    ;

exclusive_or_expression
    : (and_expression)
      (BWISE_XOR_OP exclusive_or_expression)?
    ;

and_expression
    : (equality_expression)
      (BWISE_AND_OP and_expression)?
    ;

equality_expression
    : relational_expression ((EQ_OP^|NE_OP^) relational_expression)?
    ;

relational_expression
    : additive_expression ((LT_OP^|GT_OP^|LE_OP^|GE_OP^) additive_expression)?
    ;

additive_expression
    : subtractive_expression
      (PLUS_OP additive_expression)*
    ;

subtractive_expression
    : multiplicative_expression
      (MINUS_OP subtractive_expression)*
    ;

multiplicative_expression
    : unary_expression ((DIV_OP^|MOD_OP^|MULT_OP^) unary_expression)*
    ;

unary_expression
    : (MINUS postfix_expression)
    | (bwise_unary_operator | logical_unary_operator)? postfix_expression
    ;

postfix_expression
    : primary_expression
    | function_call_expression
    ;

function_call_expression
    : fully_qualified_name LPAREN argument_expression_list? RPAREN
    ;

argument_expression_list
    : logical_or_expression (COMMA logical_or_expression)*
    ;

```



