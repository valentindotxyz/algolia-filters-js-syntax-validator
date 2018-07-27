function Lexer() {
    this.tokens = [];
    this.currentPos = 0;

    this.get = function (i) {
        if (i === undefined) {
            i = 0;
        }
        return this.tokens[this.currentPos + i];
    };

    this.next = function () {
        if (this.currentPos > this.tokens.length) {
            return null;
        }

        this.currentPos++;
    };

    this.isSeparator = function (c) {
        return c === ' ' || c === '(' || c === ')' || c === '<' || c === '>' || c === '=' || c === '!' || c === ':' || c === '\'' || c === '"';
    };

    this.readTokenValue = function (s, i) {
        let onlyNum = true;
        let nbDot = 0;
        let startPos = i;

        for (startPos = i; startPos < s.length && (!this.isSeparator(s[startPos])); startPos++) {
            onlyNum = onlyNum && ((s[startPos] >= '0' && s[startPos] <= '9') || (startPos === i && s[startPos] === '-') || (startPos > i && s[startPos] === '.' && (++nbDot) === 1));
        }

        if (startPos - i === 2 && s[i + 0] === 'O' && s[i + 1] === 'R') {
            return new Token('Token_OR', s.substr(i, startPos - i), null, i);
        } else if (startPos - i === 2 && s[i + 0] === 'T' && s[i + 1] === 'O') {
            return new Token('Token_Range', s.substr(i, startPos - i), null, i);
        } else if (startPos - i === 3 && s[i + 0] === 'N' && s[i + 1] === 'O'&& s[i + 2] === 'T') {
            return new Token('Token_NOT', s.substr(i, startPos - i), null, i);
        } else if (startPos - i === 3 && s[i + 0] === 'A' && s[i + 1] === 'N' && s[i + 2] === 'D') {
            return new Token('Token_AND', s.substr(i, startPos - i), null, i);
        } else {
            return new Token(onlyNum ? 'Token_Num' : 'Token_String', s.substr(i, startPos - i), null, i);
        }
    };

    this.readQuotedString = function (s, i) {
        const quoteType = s[i];
        let escape = false;
        let startPos = i + 1;

        for (startPos = i + 1; startPos < s.length; startPos++) {
            if (s[startPos] === quoteType && !escape) {
                if (startPos - i <= 1) { // ""
                    return new Token('Token_Empty_Str', '', null, startPos);
                } else {
                    return new Token('Token_String', s.substr(i + 1, startPos - i - 1), s.substr(i, startPos - i + 1), i);
                }
            }

            if (startPos + 1 < s.length && s[startPos] === '\\' && s[startPos + 1] === '\\') {
                startPos++;
                escape = !escape;
            }
            else {
                escape = false;
            }
        }

        return new Token('Token_Incomplete_Str', s.substr(i + 1, startPos - i), s.substr(i, startPos - i), i);
    };

    this.readToken = function (s, i) {
        if (s[i] === '=') {
            return new Token('Token_Operator', '=', null, i);
        } else if (s[i] === '<') { // < or <=
            if (s.length > i + 1 && s[i + 1] === '=') return new Token('Token_Operator', '<=', null, i);
            return new Token('Token_Open_Angled_Bracket', '<', null, i);
        } else if (s[i] === '>') { // > or >=
            if (s.length > i + 1 && s[i + 1] === '=') return new Token('Token_Operator', '>=', null, i);
            return new Token('Token_Close_Angled_Bracket', '>', null, i);
        } else if (s[i] === '!') { // !=
            if (s.length > i + 1 && s[i + 1] === '=') return new Token('Token_Operator', '!=', null, i);
            return new Token('Token_Error', s[i], null, i);
        } else if (s[i] === '(') {
            return new Token('Token_Open_Backet', '(', null, i);
        } else if (s[i] === ')') {
            return new Token('Token_Close_Bracket', ')', null, i);
        } else if (s[i] === ':') {
            return new Token('Token_Facet_Separator', ':', null, i);
        } else if (s[i] === ',') {
            return new Token('Token_Coma', ',', null, i);
        } else if (s[i] === '"' || s[i] === '\'') {
            return this.readQuotedString(s, i);
        } else {
            return this.readTokenValue(s, i); // STRING, NUM OR or AND
        }
    };

    this.lex = function(s) {
        let i = 0;
        while (i < s.length && s[i].search(/\s/) !== -1) i++;

        while (i < s.length) {
            let token = this.readToken(s, i);
            this.tokens.push(token);

            if (token.type === 'Token_Error') {
                this.currentPos = this.tokens.length - 1;
                return false;
            }
            i += token.raw_value.length;

            while (i < s.length && s[i].search(/\s/) !== -1) i++;
        }
        this.tokens.push(new Token('Token_EOF', 'E', null, s.length));

        console.log(this.tokens);

        return true;
    }
}