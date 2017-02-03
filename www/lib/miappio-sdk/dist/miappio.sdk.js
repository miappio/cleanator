var miapp;
if (!miapp) miapp = {};

/**
 * AES implementation in JavaScript (c) Chris Veness 2005-2012
 * see http://csrc.nist.gov/publications/PubsFIPS.html#197
 *
 * @class miapp.Aes
 */
miapp.Aes = (function () {
    'use strict';


    var Aes = {};

    // Public API

    /**
     * Encrypt a text using AES encryption in Counter mode of operation
     *
     * Unicode multi-byte character safe
     *
     * @param {String} plaintext Source text to be encrypted
     * @param {String} stringkey The key (128, 192, or 256 bits long)
     * @returns {string}         Encrypted text
     */
    Aes.encrypt = function (plaintext, stringkey) {
        var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(stringkey.length == 16 || stringkey.length == 24 || stringkey.length == 32)) return '';  // standard allows 128/192/256 bit keys
        var key = new Array(stringkey.length);
        for (var i = 0; i < stringkey.length; i++) key[i] = stringkey.charCodeAt(i) & 0xff;
        var counterBlock = new Array(blockSize);
        var keySchedule = keyExpansion(key);
        var blockCount = Math.ceil(plaintext.length / blockSize);
        var ciphertxt = new Array(blockCount);

        for (var i = 0; i < blockSize; i++) counterBlock[i] = 0;
        for (var b = 0; b < blockCount; b++) {
            for (var i = 0; i < blockSize; i++) {
                counterBlock[i] ^= plaintext.charCodeAt(b * blockSize + i) & 0xff;
            }

            var cipherCntr = cipher(counterBlock, keySchedule);

            // block size is reduced on final block : TODO : do not reduce but write length
            var blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
            var cipherChar = new Array(blockLength);
            for (var i = 0; i < blockLength; i++) {
                cipherChar[i] = String.fromCharCode(cipherCntr[i]);
            }
            ciphertxt[b] = cipherChar.join('');

            //for (var i = 0; i < blockSize; i++) counterBlock[i] = cipherCntr[i];
            for (var i = 0; i < blockSize; i++) counterBlock[i] = 0;
        }

        // Array.join is more efficient than repeated string concatenation in IE
        return ciphertxt.join('');
    };

    /**
     * Decrypt a text encrypted by AES in counter mode of operation
     *
     * @param {String} ciphertext Source text to be decrypted
     * @param {String} stringkey  The key (128, 192, or 256 bits long)
     * @returns {String}          Decrypted text
     */
    Aes.decrypt = function (ciphertext, stringkey) {
        var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(stringkey.length == 16 || stringkey.length == 24 || stringkey.length == 32)) return '';  // standard allows 128/192/256 bit keys
        var key = new Array(stringkey.length);
        for (var i = 0; i < stringkey.length; i++) key[i] = stringkey.charCodeAt(i) & 0xff;
        var counterBlock = new Array(blockSize);
        var keySchedule = keyExpansion(key);
        var blockCount = Math.ceil(ciphertext.length / blockSize);
        var plaintxt = new Array(blockCount);

        for (var i = 0; i < blockSize; i++) counterBlock[i] = 0;
        for (var b = 0; b < blockCount; b++) {
            for (var i = 0; i < blockSize; i++) {
                counterBlock[i] ^= ciphertext.charCodeAt(b * blockSize + i) & 0xff;
            }

            var cipherCntr = decipher(counterBlock, keySchedule);

            // block size is reduced on final block : TODO : do not reduce but read length
            var blockLength = b < blockCount - 1 ? blockSize : (ciphertext.length - 1) % blockSize + 1;
            var cipherChar = new Array(blockLength);
            for (var i = 0; i < blockLength; i++) {
                cipherChar[i] = String.fromCharCode(cipherCntr[i]);
            }
            plaintxt[b] = cipherChar.join('');

            //for (var i = 0; i < blockSize; i++) counterBlock[i] = cipherCntr[i];
            for (var i = 0; i < blockSize; i++) counterBlock[i] = 0;
        }

        // join array of blocks into single plaintext string
        return plaintxt.join('');
    };

    /**
     * Encrypt a text using AES encryption in Counter mode of operation
     *
     * Unicode multi-byte character safe
     *
     * @param {String} plaintext Source text to be encrypted
     * @param {String} stringkey The key (128, 192, or 256 bits long)
     * @returns {string}         Encrypted text
     */
    Aes.ctrEncrypt = function (plaintext, stringkey) {
        var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(stringkey.length == 16 || stringkey.length == 24 || stringkey.length == 32)) return '';  // standard allows 128/192/256 bit keys
        plaintext = miapp.Utf8.encode(plaintext);
        //var t = new Date();  // timer
        var key = new Array(stringkey.length);
        for (var i = 0; i < stringkey.length; i++) key[i] = stringkey[i] & 0xff;

        // initialise 1st 8 bytes of counter block with nonce (NIST SP800-38A �B.2): [0-1] = millisec,
        // [2-3] = random, [4-7] = seconds, together giving full sub-millisec uniqueness up to Feb 2106
        var counterBlock = new Array(blockSize);

        var nonce = (new Date()).getTime();  // timestamp: milliseconds since 1-Jan-1970
        var nonceMs = nonce % 1000;
        var nonceSec = Math.floor(nonce / 1000);
        var nonceRnd = Math.floor(Math.random() * 0xffff);

        for (var i = 0; i < 2; i++) counterBlock[i] = (nonceMs >>> i * 8) & 0xff;
        for (var i = 0; i < 2; i++) counterBlock[i + 2] = (nonceRnd >>> i * 8) & 0xff;
        for (var i = 0; i < 4; i++) counterBlock[i + 4] = (nonceSec >>> i * 8) & 0xff;

        // and convert it to a string to go on the front of the ciphertext
        var ctrTxt = '';
        for (var i = 0; i < 8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

        // generate key schedule - an expansion of the key into distinct Key Rounds for each round
        var keySchedule = keyExpansion(key);

        var blockCount = Math.ceil(plaintext.length / blockSize);
        var ciphertxt = new Array(blockCount);  // ciphertext as array of strings

        for (var b = 0; b < blockCount; b++) {
            // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
            // done in two stages for 32-bit ops: using two words allows us to go past 2^32 blocks (68GB)
            for (var c = 0; c < 4; c++) counterBlock[15 - c] = (b >>> c * 8) & 0xff;
            for (var c = 0; c < 4; c++) counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8)

            var cipherCntr = cipher(counterBlock, keySchedule);  // -- encrypt counter block --

            // block size is reduced on final block
            var blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
            var cipherChar = new Array(blockLength);

            for (var i = 0; i < blockLength; i++) {  // -- xor plaintext with ciphered counter char-by-char --
                cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
                cipherChar[i] = String.fromCharCode(cipherChar[i]);
            }
            ciphertxt[b] = cipherChar.join('');
        }

        // Array.join is more efficient than repeated string concatenation in IE
        var ciphertext = ctrTxt + ciphertxt.join('');
        //ciphertext = miapp.Base64.encode(ciphertext);

        //alert((new Date()) - t);
        return ciphertext;
    };

    /**
     * Decrypt a text encrypted by AES in counter mode of operation
     *
     * @param {String} ciphertext Source text to be decrypted
     * @param {String} stringkey  The key (128, 192, or 256 bits long)
     * @returns {String}          Decrypted text
     */
    Aes.ctrDecrypt = function (ciphertext, stringkey) {
        var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
        if (!(stringkey.length == 16 || stringkey.length == 24 || stringkey.length == 32)) return '';  // standard allows 128/192/256 bit keys
        //ciphertext = miapp.Base64.decode(ciphertext);
        //var t = new Date();  // timer
        var key = new Array(stringkey.length);
        for (var i = 0; i < stringkey.length; i++) key[i] = stringkey[i] & 0xff;

        // recover nonce from 1st 8 bytes of ciphertext
        var counterBlock = new Array(8);
        var ctrTxt = ciphertext.slice(0, 8);
        for (var i = 0; i < 8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);

        // generate key schedule
        var keySchedule = keyExpansion(key);

        // separate ciphertext into blocks (skipping past initial 8 bytes)
        var nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
        var ct = new Array(nBlocks);
        for (var b = 0; b < nBlocks; b++) ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
        ciphertext = ct;  // ciphertext is now array of block-length strings

        // plaintext will get generated block-by-block into array of block-length strings
        var plaintxt = new Array(ciphertext.length);

        for (var b = 0; b < nBlocks; b++) {
            // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
            for (var c = 0; c < 4; c++) counterBlock[15 - c] = ((b) >>> c * 8) & 0xff;
            for (var c = 0; c < 4; c++) counterBlock[15 - c - 4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;

            var cipherCntr = cipher(counterBlock, keySchedule);  // encrypt counter block

            var plaintxtByte = new Array(ciphertext[b].length);
            for (var i = 0; i < ciphertext[b].length; i++) {
                // -- xor plaintxt with ciphered counter byte-by-byte --
                plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
            }
            plaintxt[b] = plaintxtByte.join('');
        }

        // join array of blocks into single plaintext string
        var plaintext = plaintxt.join('');
        plaintext = miapp.Utf8.decode(plaintext);  // decode from UTF8 back to Unicode multi-byte chars

        //alert((new Date()) - t);
        return plaintext;
    };

    /**
     * AES Cipher function: encrypt 'input' state with Rijndael algorithm
     *   applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage
     *
     * @param {Number[]} input 16-byte (128-bit) input state array
     * @param {Number[][]} w   Key schedule as 2D byte-array (Nr+1 x Nb bytes)
     * @returns {Number[]}     Encrypted output state array
     */
    function cipher(input, w) {
        var Nb = 4; // Number of columns (32-bit words) comprising the State. For this standard, Nb = 4.
        var Nr = w.length / Nb - 1; // no of rounds: 10/12/14 for 128/192/256-bit keys
        var round = 0;
        var trace;
        var state = [
            [],
            [],
            [],
            []
        ];  // initialise 4xNb byte-array 'state' with input [�3.4]
        for (var i = 0; i < 4 * Nb; i++) state[i % 4][Math.floor(i / 4)] = input[i];

        //trace = new Array(4 * Nb);
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(input[i]);
        //console.log('round['+round+'] input='+miapp.Hex.encode(trace.join('')));

        //trace = new Array(4 * Nb);
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(w[round * 4 + Math.floor(i / 4)][i % 4]);
        //console.log('round['+round+'] k_sch='+miapp.Hex.encode(trace.join('')));

        state = addRoundKey(state, w, round, Nb);

        for (round++; round < Nr; round++) {
            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] start='+miapp.Hex.encode(trace.join('')));

            state = subBytes(state, Nb);

            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] s_box='+miapp.Hex.encode(trace.join('')));

            state = shiftRows(state, Nb);

            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] s_row='+miapp.Hex.encode(trace.join('')));

            state = mixColumns(state, Nb);

            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] m_col='+miapp.Hex.encode(trace.join('')));

            //trace = new Array(4 * Nb);
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(w[round * 4 + Math.floor(i / 4)][i % 4]);
            //console.log('round['+round+'] k_sch='+miapp.Hex.encode(trace.join('')));

            state = addRoundKey(state, w, round, Nb);
        }

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
        //console.log('round['+round+'] start='+miapp.Hex.encode(trace.join('')));

        state = subBytes(state, Nb);

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
        //console.log('round['+round+'] s_box='+miapp.Hex.encode(trace.join('')));

        state = shiftRows(state, Nb);

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
        //console.log('round['+round+'] s_row='+miapp.Hex.encode(trace.join('')));

        state = addRoundKey(state, w, round, Nb);

        var output = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        for (var i = 0; i < (4 * Nb); i++) output[i] = state[i % 4][Math.floor(i / 4)];

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(output[i]);
        //console.log('round['+round+'] output='+miapp.Hex.encode(trace.join('')));

        return output;
    }

    /**
     * AES Cipher function: decrypt 'input' state with Rijndael algorithm
     *   applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage
     *
     * @param {Number[]} input 16-byte (128-bit) input state array
     * @param {Number[][]} w   Key schedule as 2D byte-array (Nr+1 x Nb bytes)
     * @returns {Number[]}     Encrypted output state array
     */
    function decipher(input, w) {
        var Nb = 4; // Number of columns (32-bit words) comprising the State. For this standard, Nb = 4.
        var Nr = w.length / Nb - 1; // no of rounds: 10/12/14 for 128/192/256-bit keys
        var round = Nr;
        var trace;
        var state = [
            [],
            [],
            [],
            []
        ];  // initialise 4xNb byte-array 'state' with input [�3.4]
        for (var i = 0; i < 4 * Nb; i++) state[i % 4][Math.floor(i / 4)] = input[i];

        //trace = new Array(4 * Nb);
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(input[i]);
        //console.log('round['+round+'] input='+miapp.Hex.encode(trace.join('')));

        //trace = new Array(4 * Nb);
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(w[round * 4 + Math.floor(i / 4)][i % 4]);
        //console.log('round['+round+'] k_sch='+miapp.Hex.encode(trace.join('')));

        state = addRoundKey(state, w, round, Nb);

        for (round--; round > 0; round--) {
            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] start='+miapp.Hex.encode(trace.join('')));

            state = invShiftRows(state, Nb);

            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] s_row='+miapp.Hex.encode(trace.join('')));

            state = invSubBytes(state, Nb);

            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] s_box='+miapp.Hex.encode(trace.join('')));

            //trace = new Array(4 * Nb);
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(w[round * 4 + Math.floor(i / 4)][i % 4]);
            //console.log('round['+round+'] k_sch='+miapp.Hex.encode(trace.join('')));

            state = addRoundKey(state, w, round, Nb);

            // trace
            //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
            //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
            //console.log('round['+round+'] k_add='+miapp.Hex.encode(trace.join('')));

            state = invMixColumns(state, Nb);
        }

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
        //console.log('round['+round+'] start='+miapp.Hex.encode(trace.join('')));

        state = invShiftRows(state, Nb);

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
        //console.log('round['+round+'] s_row='+miapp.Hex.encode(trace.join('')));

        state = invSubBytes(state, Nb);

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(state[i % 4][Math.floor(i / 4)]);
        //console.log('round['+round+'] s_box='+miapp.Hex.encode(trace.join('')));

        //trace = new Array(4 * Nb);
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(w[round * 4 + Math.floor(i / 4)][i % 4]);
        //console.log('round['+round+'] k_sch='+miapp.Hex.encode(trace.join('')));

        state = addRoundKey(state, w, round, Nb);

        var output = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        for (var i = 0; i < (4 * Nb); i++) output[i] = state[i % 4][Math.floor(i / 4)];

        // trace
        //trace = new Array(4 * Nb);  // convert state to 1-d array before returning [�3.4]
        //for (var i = 0; i < (4 * Nb); i++) trace[i] = String.fromCharCode(output[i]);
        //console.log('round['+round+'] output='+miapp.Hex.encode(trace.join('')));

        return output;
    }

    /**
     * Perform Key Expansion to generate a Key Schedule
     *
     * @param {Number[]} key Key as 16/24/32-byte array
     * @returns {Number[][]} Expanded key schedule as 2D byte-array (Nr+1 x Nb bytes)
     */
    function keyExpansion(key) {  // generate Key Schedule (byte-array Nr+1 x Nb) from Key [�5.2]
        var Nb = 4; // Number of columns (32-bit words) comprising the State. For this standard, Nb = 4.
        var Nk = key.length / 4;  // Number of 32-bit words comprising the Cipher Key. Nk = 4/6/8 for 128/192/256-bit keys
        var Nr = Nk + 6;       // Number of rounds. Nr = 10/12/14 for 128/192/256-bit keys
        var trace;

        var w = new Array(Nb * (Nr + 1));
        var temp = new Array(4);

        for (var i = 0; i < Nk; i++) {
            var r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
            w[i] = r;
            /*
             trace = new Array(4);
             for (var t = 0; t < 4; t++) trace[t] = String.fromCharCode(w[i][t]);
             console.log('w['+i+']='+miapp.Hex.encode(trace.join('')));
             */
        }

        for (var i = Nk; i < (Nb * (Nr + 1)); i++) {
            w[i] = new Array(4);
            for (var t = 0; t < 4; t++) temp[t] = w[i - 1][t];
            if (i % Nk == 0) {
                temp = subWord(rotWord(temp));
                for (var t = 0; t < 4; t++) temp[t] ^= rCon[i / Nk][t];
            } else if (Nk > 6 && i % Nk == 4) {
                temp = subWord(temp);
            }
            for (var t = 0; t < 4; t++) w[i][t] = w[i - Nk][t] ^ temp[t];
            /*
             trace = new Array(4);
             for (var t = 0; t < 4; t++) trace[t] = String.fromCharCode(w[i][t]);
             console.log('w['+i+']='+miapp.Hex.encode(trace.join('')));
             */
        }

        return w;
    }

    function subBytes(s, Nb) {    // apply SBox to state S [�5.1.1]
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < Nb; c++) s[r][c] = sBox[s[r][c]];
        }
        return s;
    }

    function invSubBytes(s, Nb) {    // apply SBox to state S [�5.1.1]
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < Nb; c++) s[r][c] = invsBox[s[r][c]];
        }
        return s;
    }

    function shiftRows(s, Nb) {    // shift row r of state S left by r bytes [�5.1.2]
        var t = new Array(4);
        for (var r = 1; r < 4; r++) {
            for (var c = 0; c < 4; c++) t[c] = s[r][(c + r) % Nb];  // shift into temp copy
            for (var c = 0; c < 4; c++) s[r][c] = t[c];         // and copy back
        }          // note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
        return s;  // see asmaes.sourceforge.net/rijndael/rijndaelImplementation.pdf
    }

    function invShiftRows(s, Nb) {    // shift row r of state S left by r bytes [�5.1.2]
        var t = new Array(4);
        for (var r = 1; r < 4; r++) {
            for (var c = 0; c < 4; c++) t[c] = s[r][c];  // shift into temp copy
            for (var c = 0; c < 4; c++) s[r][(c + r) % Nb] = t[c];         // and copy back
        }          // note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
        return s;  // see asmaes.sourceforge.net/rijndael/rijndaelImplementation.pdf
    }

    function mixColumns(s, Nb) {   // combine bytes of each col of state S [�5.1.3]
        for (var c = 0; c < 4; c++) {
            var a = new Array(4);  // 'a' is a copy of the current column from 's'
            var a2 = new Array(4);  // 'b' is a�{02} in GF(2^8)
            for (var i = 0; i < 4; i++) {
                a[i] = s[i][c];
                a2[i] = a[i] & 0x80 ? a[i] << 1 ^ 0x011b : a[i] << 1;
            }
            // a[n] ^ b[n] is a�{03} in GF(2^8)
            s[0][c] = a2[0] ^ a[1] ^ a2[1] ^ a[2] ^ a[3]; // 2*a0 + 3*a1 + a2 + a3
            s[1][c] = a2[1] ^ a[2] ^ a2[2] ^ a[3] ^ a[0]; // a0 * 2*a1 + 3*a2 + a3
            s[2][c] = a2[2] ^ a[3] ^ a2[3] ^ a[0] ^ a[1]; // a0 + a1 + 2*a2 + 3*a3
            s[3][c] = a2[3] ^ a[0] ^ a2[0] ^ a[1] ^ a[2]; // 3*a0 + a1 + a2 + 2*a3
        }
        return s;
    }

    function invMixColumns(s, Nb) {   // combine bytes of each col of state S [�5.1.3]
        for (var c = 0; c < 4; c++) {
            var a = new Array(4);  // 'a' is a copy of the current column from 's'
            var a2 = new Array(4);  // 'b' is a�{02} in GF(2^8)
            var a4 = new Array(4);  // 'c' is b�{02} = a�{04} in GF(2^8)
            var a8 = new Array(4);  // 'd' is c�{02} = a�{08} in GF(2^8)
            for (var i = 0; i < 4; i++) {
                a[i] = s[i][c];
                a2[i] = a[i] & 0x80 ? a[i] << 1 ^ 0x011b : a[i] << 1;
                a4[i] = a2[i] & 0x80 ? a2[i] << 1 ^ 0x011b : a2[i] << 1;
                a8[i] = a4[i] & 0x80 ? a4[i] << 1 ^ 0x011b : a4[i] << 1;
            }
            // a[n] ^ b[n] is a�{03} in GF(2^8)
            s[0][c] = a8[0] ^ a4[0] ^ a2[0] ^ a8[1] ^ a2[1] ^ a[1] ^ a8[2] ^ a4[2] ^ a[2] ^ a8[3] ^ a[3]; // e*a0 + b*a1 + d*a2 + 9*a3
            s[1][c] = a8[1] ^ a4[1] ^ a2[1] ^ a8[2] ^ a2[2] ^ a[2] ^ a8[3] ^ a4[3] ^ a[3] ^ a8[0] ^ a[0]; // 9*a0 * e*a1 + b*a2 + d*a3
            s[2][c] = a8[2] ^ a4[2] ^ a2[2] ^ a8[3] ^ a2[3] ^ a[3] ^ a8[0] ^ a4[0] ^ a[0] ^ a8[1] ^ a[1]; // d*a0 + 9*a1 + e*a2 + b*a3
            s[3][c] = a8[3] ^ a4[3] ^ a2[3] ^ a8[0] ^ a2[0] ^ a[0] ^ a8[1] ^ a4[1] ^ a[1] ^ a8[2] ^ a[2]; // b*a0 + d*a1 + 9*a2 + e*a3
        }
        return s;
    }

    function addRoundKey(state, w, rnd, Nb) {  // xor Round Key into state S [�5.1.4]
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < Nb; c++) state[r][c] ^= w[rnd * 4 + c][r];
        }
        return state;
    }

    function subWord(w) {    // apply SBox to 4-byte word w
        for (var i = 0; i < 4; i++) w[i] = sBox[w[i]];
        return w;
    }

    function rotWord(w) {    // rotate 4-byte word w left by one byte
        var tmp = w[0];
        for (var i = 0; i < 3; i++) w[i] = w[i + 1];
        w[3] = tmp;
        return w;
    }

    // sBox is pre-computed multiplicative inverse in GF(2^8) used in subBytes
    var sBox = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
        0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
        0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
        0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
        0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
        0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
        0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
        0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
        0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
        0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
        0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
        0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
        0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
        0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
        0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
        0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16];

    // sBox is pre-computed multiplicative inverse in GF(2^8) used in invsubBytes
    var invsBox = [0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
        0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
        0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
        0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
        0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
        0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
        0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
        0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
        0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
        0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
        0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
        0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
        0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
        0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
        0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
        0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d];

    // rCon is Round Constant used for the Key Expansion [1st col is 2^(r-1) in GF(2^8)] [�5.2]
    var rCon = [
        [0x00, 0x00, 0x00, 0x00],
        [0x01, 0x00, 0x00, 0x00],
        [0x02, 0x00, 0x00, 0x00],
        [0x04, 0x00, 0x00, 0x00],
        [0x08, 0x00, 0x00, 0x00],
        [0x10, 0x00, 0x00, 0x00],
        [0x20, 0x00, 0x00, 0x00],
        [0x40, 0x00, 0x00, 0x00],
        [0x80, 0x00, 0x00, 0x00],
        [0x1b, 0x00, 0x00, 0x00],
        [0x36, 0x00, 0x00, 0x00]
    ];

    // Private API
    // helper functions and variables hidden within this function scope

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Aes;
})(); // Invoke the function immediately to create this class.

/**
 * Miapp Tools SDK : Help your app to manage filestorage, crypto, analytics ...
 * @namespace miapp
 */
var miapp;
if (!miapp) miapp = {};


// Usefull
var miappBlockMove = function (evt,stopBubble) {
    'use strict';
    //console.log('miappBlockMove');
    // All but scrollable element = .c4p-container-scroll-y
    //if (evt.preventDefault) evt.preventDefault() ;
    //if (evt.preventDefault && !$(evt.target).parents('.c4p-container-scroll-y')[0]) {
    //    evt.preventDefault();
    //}
    if (evt.preventDefault && !$('.c4p-container-scroll-y').has($(evt.target)).length) {
        evt.preventDefault();
    }

    if (stopBubble && evt.stopPropagation) evt.stopPropagation();
    if (stopBubble && !evt.cancelBubble) evt.cancelBubble = true;


};

var miappAllowMove = function (e) {
    //console.log('miappAllowMove');
    return true ;
};


var miappFakeConsoleLog = function (e) {
    //console.log('miappAllowMove');
    return true;
};

// Should be created by Cordova (or CordovaMocks)
var LocalFileSystem;
var Metadata;
var FileError;
var ProgressEvent;
var File;
var DirectoryEntry;
var DirectoryReader;
var FileWriter;
var FileEntry;
var FileSystem;
var FileReader;
var FileTransferError;
var FileUploadOptions;
var FileUploadResult;
var FileTransfer;
var Camera;
//var calendarPlugin;
//var analytics;

// A consistent way to create a unique ID which will never overflow.

miapp.uid  = ['0', '0', '0'];
miapp.idStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
miapp.idNext = {
    '0':1, '1':2, '2':3, '3':4, '4':5, '5':6, '6':7, '7':8, '8':9, '9':10,
    'A':11, 'B':12, 'C':13, 'D':14, 'E':15, 'F':16, 'G':17, 'H':18, 'I':19, 'J':20,
    'K':21, 'L':22, 'M':23, 'N':24, 'O':25, 'P':26, 'Q':27, 'R':28, 'S':29, 'T':30,
    'U':31, 'V':32, 'W':33, 'X':34, 'Y':35, 'Z':0
};

miapp.nextUid = function() {
    var index = miapp.uid.length;
    while (index) {
        index--;
        var i = miapp.idNext[miapp.uid[index]];
        miapp.uid[index] = miapp.idStr[i];
        if (i > 0) {
            return miapp.uid.join('');
        }
    }
    miapp.uid.unshift('0');
    return miapp.uid.join('');
};

miapp.getUid = function() {
    return miapp.uid.join('');
};

miapp.initUid = function(seed) {
    if (miapp.isUndefined(seed)) {
        miapp.uid  = ['0', '0', '0'];
        return;
    }
    seed = seed.toUpperCase();
    miapp.uid  = [];
    for (var i = 0, n = seed.length; i < n; i++) {
        var c = seed.charAt(i);
        if (miapp.isDefined(miapp.idNext[c])) {
            miapp.uid.push(c);
        }
    }
    while (miapp.uid.length < 3) {
        miapp.uid.unshift('0');
    }
};

/**
 * Function to test the undefined of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isUndefined = function(obj) {
    return (typeof(obj) == 'undefined');
};

/**
 * Function to test the non-undefined of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isDefined = function(obj) {
    return (typeof(obj) != 'undefined');
};

/**
 * Function to test the undefined or nullity of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isUndefinedOrNull = function(obj) {
    return (typeof(obj) == 'undefined') || (obj === null);
};

/**
 * Function to test the non-undefined and non-null of any variable
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isDefinedAndNotNull = function(obj) {
    return (typeof(obj) != 'undefined') && (obj !== null);
};

// Speed up calls to hasOwnProperty
//var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Function to test the emptiest of any variable
 * Ex: undefined, null, {}, [], '' are empty
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isEmptyOrFalse = function(obj) {
    'use strict';
    switch (typeof(obj)) {
        case 'object' :
            /*for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }*/
            // Object.getOwnPropertyNames throw exception on null object
            if (obj === null) return true;
            if (Object.getOwnPropertyNames(obj).length === 0) return true;
            // Beware Document objects have a 'length' attr about the body attribute
            if (obj instanceof Array) {
                return (obj.length === 0);
            } else {
                return false;
            }
            break;
        case 'string' :
            return (obj.length === 0);
        case 'number' :
            return (obj === 0);
        case 'boolean' :
            return !obj;
        case 'function' :
            return false;
        case 'undefined' :
            return true;
    }
    return !obj;
};

/**
 * Function to test the emptiest of any variable
 * Ex: undefined, null, {}, [], '' are empty
 *
 * @param obj
 * @returns {boolean}
 */
miapp.isTrueOrNonEmpty = function(obj) {
    switch (typeof(obj)) {
        case 'object' :
            /*for (var key in obj) {
                if (hasOwnProperty.call(obj, key)) return false;
            }*/
            // Object.getOwnPropertyNames throw exception on null object
            if (obj === null) return false;
            if (Object.getOwnPropertyNames(obj).length === 0) return false;
            // Beware Document objects have a 'length' attr about the body attribute
            if (obj instanceof Array) {
                return (obj.length !== 0);
            } else {
                return true;
            }
            break;
        case 'string' :
            return (obj.length !== 0);
        case 'number' :
            return (obj !== 0);
        case 'boolean' :
            return obj;
        case 'function' :
            return true;
        case 'undefined' :
            return false;
    }
    return !!obj;
};

/**
 * Safe $apply with evaluation in scope context : asynchronous if we are already in $$phase, direct if not
 *
 * To execute expr in next $apply, you should use $timeout(function() {scope.$apply(expr);}, 0);
 *
 * @param scope
 * @param expr
 */
miapp.safeApply = function (scope, expr, beforeFct, afterFct) {

    if (beforeFct) miapp.safeApply(scope,beforeFct);

    // Check scope.$root.$$phase because it is always true during any $apply(), while scope.$$phase is NOT always true
    if (scope.$root && scope.$root.$$phase) {
        // Queue in scope.$root, because in scope it will not be evaluated in $digest()
        // scope.$digest() is not executed, ONLY $rootScope.$digest() is executed.
        console.log('safeApply - scope.$root outside the $digest');
        scope.$root.$evalAsync(function() {
            scope.$eval(expr);
        });
    }
    else if (scope.$treeScope && scope.$treeScope.$apply){
        console.log('safeApply - scope.$treeScope for callback');
        scope.$treeScope.$apply(expr);
    }
    else if (scope.$apply && (scope.$apply != angular.noop)) {
        console.log('safeApply - scope.$apply');
        scope.$apply(expr);
    }
    else {
        console.log('safeApply - na : dangerous ?');
        expr();
    }

    if (afterFct) miapp.safeApply(scope,afterFct);
};

/**
 * Solution to work around an XHR issue : sometimes no end if no $Apply under Chrome for example.
 * This solution trigger an $apply to hope triggering the XHR end.
 */
miapp.promiseWakeupNb = 0; // number of simultaneous active httpPromise
miapp.promiseWakeupTimeout = null;
miapp.promiseWakeup = function (scope, httpPromise, fctOnHttpSuccess, fctOnHttpError) {
    var promiseWakeupOnHttpSuccess = function(response) {
        //miapp.InternalLog.log("miapp.promiseWakeup.tick", "promiseWakeupOnHttpSuccess?");
        miapp.promiseWakeupNb--;
        // Keep tick function active until all httpPromise end
        if (miapp.promiseWakeupNb <= 0) {
            miapp.InternalLog.log("miapp.promiseWakeup.tick", "stop");
            miapp.promiseWakeupNb = 0;
            clearTimeout(miapp.promiseWakeupTimeout);
            miapp.promiseWakeupTimeout = null;
        }
        fctOnHttpSuccess(response);
    };
    var promiseWakeupOnHttpError = function(response) {
        //miapp.InternalLog.log("miapp.promiseWakeup.tick", "promiseWakeupOnHttpError?");
        miapp.promiseWakeupNb--;
        // Keep tick function active until all httpPromise end
        if (miapp.promiseWakeupNb <= 0) {
            miapp.InternalLog.log("miapp.promiseWakeup.tick", "stop");
            miapp.promiseWakeupNb = 0;
            clearTimeout(miapp.promiseWakeupTimeout);
            miapp.promiseWakeupTimeout = null;
        }
        fctOnHttpError(response);
    };
    function tick() {
        if (miapp.promiseWakeupNb > 0) {
            //miapp.InternalLog.log("miapp.promiseWakeup.tick", "scope.$apply");
            miapp.safeApply(scope);
            // Usage of $timeout breaks e2e tests for the moment : https://github.com/angular/angular.js/issues/2402
            //$timeout(tick, 1000, false);// DO NOT call $apply
            miapp.promiseWakeupTimeout = setTimeout(tick, 1000);
        } else {
            //miapp.InternalLog.log("miapp.promiseWakeup.tick", "ignored");
        }
    }
    // Launch only one tick function if many httpPromise occur
    if (miapp.promiseWakeupNb === 0) {
        //miapp.InternalLog.log("miapp.promiseWakeup.tick", "start");
        miapp.promiseWakeupTimeout = setTimeout(tick, 1000);
    }
    miapp.promiseWakeupNb++;
    //miapp.InternalLog.log("miapp.promiseWakeup.tick", "before?");
    httpPromise.then(promiseWakeupOnHttpSuccess, promiseWakeupOnHttpError);
    //miapp.InternalLog.log("miapp.promiseWakeup.tick", "after?");
};

function openChildBrowser(url, extension, onLocationChange, onClose) {

    //miapp.InternalLog.log('openChildBrowser', url+' extension:'+extension);
    var closeChildBrowserAfterLocationChange = false;// To NOT call onClose() if onLocationChange() has been called
    if (!window.device){
        // Chrome case
        // We can not bind on window events because Salesforce page modify/erase our event bindings.
        miapp.InternalLog.log('openChildBrowser', 'window.open');
        var new_window = window.open(url, '_blank', 'menubar=no,scrollbars=yes,resizable=1,height=400,width=600');
        var initialLocation;
        var initialUrl;
        if (miapp.isDefinedAndNotNull(new_window.location)) {
            initialLocation = new_window.location.href;
        }
        if (miapp.isDefinedAndNotNull(new_window.document)) {
            initialUrl = new_window.document.URL;
        }
        miapp.InternalLog.log('openChildBrowser', 'initialLocation=' + initialLocation + ' initialUrl=' + initialUrl);
        var locationChanged = false;
        //if (onLocationChange) new_window.onbeforeunload = onLocationChange;
        var new_window_tracker = function () {
            if (miapp.isDefinedAndNotNull(new_window.location) && (typeof new_window.location.href == "string")) {
                //miapp.InternalLog.log('openChildBrowser', 'new location=' + new_window.location.href);
            } else if (miapp.isDefinedAndNotNull(new_window.document) && (typeof new_window.document.URL == "string")) {
                //miapp.InternalLog.log('openChildBrowser', 'new url=' + new_window.document.URL);
            }
            if (!locationChanged) {
                if (miapp.isDefinedAndNotNull(new_window.location) &&
                    (typeof new_window.location.href == "string") &&
                    (initialLocation != new_window.location.href)) {
                    miapp.InternalLog.log('openChildBrowser', 'new location=' + new_window.location.href);
                    locationChanged = true;
                    setTimeout(new_window_tracker, 100);
                    return;
                } else if (miapp.isDefinedAndNotNull(new_window.document) &&
                    (typeof new_window.document.URL == "string") &&
                    (initialUrl != new_window.document.URL)) {
                    miapp.InternalLog.log('openChildBrowser', 'new url=' + new_window.document.URL);
                    locationChanged = true;
                    setTimeout(new_window_tracker, 100);
                    return;
                }
            } else {
                if (miapp.isDefinedAndNotNull(new_window.location) &&
                    (typeof new_window.location.href == "string") &&
                    (new_window.location.href.indexOf('about:blank') >= 0)) {
                    miapp.InternalLog.log('openChildBrowser', 'onLocationChange');
                    if (onLocationChange) onLocationChange();
                    closeChildBrowserAfterLocationChange = true;
                    new_window.close();
                    return;
                } else if (miapp.isDefinedAndNotNull(new_window.document) &&
                    (typeof new_window.document.URL == "string") &&
                    (new_window.document.URL.indexOf('about:blank') >= 0)) {
                    miapp.InternalLog.log('openChildBrowser', 'onUrlChange');
                    if (onLocationChange) onLocationChange();
                    closeChildBrowserAfterLocationChange = true;
                    new_window.close();
                    return;
                }
            }
            if (new_window.closed) {
                miapp.InternalLog.log('openChildBrowser', 'onClose');
                if (!closeChildBrowserAfterLocationChange) {
                    if (onClose) onClose();
                }
                return;
            }
            //miapp.InternalLog.log('openChildBrowser', 'track locationChanged=' + locationChanged);
            setTimeout(new_window_tracker, 100);
        };
        setTimeout(new_window_tracker, 100);

  }
  else {
        miapp.InternalLog.log('openChildBrowser', 'cordova : window.open');
        var target = '_blank';
        if (extension != 'url' && window.device.platform === "Android") target = '_system';
        var ref = window.open(url, target,'location=no' );//'_blank', 'location=yes');'_system','location=no'
        ref.addEventListener('loadstart', function(e){
          miapp.InternalLog.log('openChildBrowser', 'loadstart '+e.url);
        });
        ref.addEventListener('loadstop', function(e){
          miapp.InternalLog.log('openChildBrowser', 'loadstop '+e.url);
          if (typeof e.url == "string" && e.url.indexOf("about:blank") >= 0) {
              closeChildBrowserAfterLocationChange = true;
              if (onLocationChange) onLocationChange();
              ref.close();
          }
        });
        ref.addEventListener('loaderror', function(e){
          miapp.InternalLog.log('openChildBrowser', 'loaderror '+e.url);
        });
        ref.addEventListener('exit', function(e){
          miapp.InternalLog.log('openChildBrowser', 'exit '+e.url);
          if(!closeChildBrowserAfterLocationChange){
            if (onClose) onClose();
          }
        });
  }
}

function closeWindow()
{
   window.close();
}

function isArray(obj) {
    // do an instanceof check first
    if (obj instanceof Array) {
        return true;
    }
    // then check for obvious falses
    if (typeof obj !== 'object') {
        return false;
    }
    if (miapp.isUndefined(obj) || (obj === null)) {
        return false;
    }
    if (Object.prototype.toString.call(obj) === '[object Array]') {
        return true;
    }
    return false;
}

function updateImage(source,img) {
  if (img && img != '/.')
    source.src = img;
  else
    source.src = "./img/broken.png";

  source.onerror = "";
  return true;
}

function ImgError(source, img){

    setTimeout(function() {updateImage(source,img);}, 10000);
    return false;
}

function getErrorObject(){
    try { throw Error(''); } catch(err) { return err; }
}

function miappExportJson(input, maxDepth) {
    var str = '{\n', key, first = true, type;
    for (key in input) {
        if (!input.hasOwnProperty(key)) continue;
        if (key != 'Contact' && key != 'Attendee' && key != 'Account' &&
           key != 'Opportunity' && key != 'Event' && key != 'Document') continue;
        type = key;
        if (first) {
            first = false;
        } else {
            str += ',\n';
        }
        str +='\t' + '\"' + key + '\":[\n';

        if (typeof input[key] === "object") {
            if (maxDepth > 0) {
                str += miappExportJsonObject('\t\t', input[key], maxDepth-1, type);
            }
        }
        str +='\t' + ']';
    }
    str +='\n}\n';

    return str;
}

function miappExportJsonObject(offset, input, maxDepth, type) {
    var str = "", key, first = true;
    for (key in input) {
        if (!input.hasOwnProperty(key)) continue;
        if (first) {
            first = false;
        } else {
            str += ',\n';
        }
        if (typeof input[key] === "object") {
            if (maxDepth > 0) {
                if (maxDepth == 2) {
                    str += offset + '{\n';
                } else {
                    str += offset + '\"' +key+ '\":{';
                }
                str += miappExportJsonObject(offset + '\t', input[key], maxDepth-1, type);

                if (maxDepth == 2) {
                    str += offset + '}';
                } else {
                    str += '}';
                }
            }
        } else {
            if (typeof input[key] == 'string') {
                input[key] = input[key].replace(/\r/ig, ' ').replace(/\n/ig, ' ');
            }
            if (maxDepth === 0) {
                str += '\"' +key + '\":\"' + input[key] + '\"';
            } else {
                str += offset + '\"' +key + '\":\"' + input[key] + '\"';
            }

        }
    }
    if(maxDepth == 1 && type == 'Document'){
      str += ',\n' + offset +'\"url\":\"img/samples/docs/' + input.name + '\"';
    }
    if(maxDepth !== 0){
      str +='\n';
    }

    return str;
}


var cache = window.applicationCache;
var cacheStatusValues = [];

function logEvent(e) {
    var online, status, type, message;
    var bCon = checkConnection();
    online = (bCon) ? 'yes' : 'no';
    status = cacheStatusValues[cache.status];
    type = e.type;
    message = 'CACHE online: ' + online;
    message+= ', event: ' + type;
    message+= ', status: ' + status;
    if (type == 'error' && bCon) {
        message+= ' (prolly a syntax error in manifest)';
    }
    miapp.InternalLog.log(message);
}

//window.applicationCache.addEventListener(
//    'updateready',
//    function(){
//        window.applicationCache.swapCache();
//        miapp.InternalLog.log('swap cache has been called');
//    },
//    false
//);

//setInterval(function(){cache.update()}, 10000);


function checkCache() {
// Check if new appcache is available, load it, and reload page.
//if (window.applicationCache) {
//  window.applicationCache.addEventListener('updateready', function(e) {
//    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
//      window.applicationCache.swapCache();
//      if (confirm('A new version of this site is available. Load it?')) {
//        window.location.reload();
//      }
//    }
//  }, false);
//}

	if(cache) {

		cacheStatusValues[0] = 'uncached';
		cacheStatusValues[1] = 'idle';
		cacheStatusValues[2] = 'checking';
		cacheStatusValues[3] = 'downloading';
		cacheStatusValues[4] = 'updateready';
		cacheStatusValues[5] = 'obsolete';

		cache.addEventListener('cached', logEvent, false);
		cache.addEventListener('checking', logEvent, false);
		cache.addEventListener('downloading', logEvent, false);
		cache.addEventListener('error', logEvent, false);
		cache.addEventListener('noupdate', logEvent, false);
		cache.addEventListener('obsolete', logEvent, false);
		cache.addEventListener('progress', logEvent, false);
		cache.addEventListener('updateready', logEvent, false);
	}

}

function checkConnection() {

    var bCon = false;
    miapp.InternalLog.log('checkConnection','launched');
    /*
        if (!navigator.onLine) used or not ?
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    alert('Connection type: ' + states[networkState]);


	if (navigator.network && navigator.network.connection && !navigator.network.connection.type) return false;

	if (!navigator.network || !navigator.network.connection){
		if (navigator.onLine) {
            miapp.InternalLog.log('checkConnection','without cordova but online');
			return true;
		}
        else {
            miapp.InternalLog.log('checkConnection','without cordova but online');
            return false;
        }
	}

    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    miapp.InternalLog.log('checkConnection','Connection type: ' + states[networkState]);
    bCon = (networkState != Connection.NONE);
    return bCon;
     */

     if (!navigator.connection || !navigator.connection.type){
        if (miapp.BrowserCapabilities && miapp.BrowserCapabilities.online) {
            bCon = true;
        }
        else if (!miapp.BrowserCapabilities) {
            bCon = navigator.onLine;
        }
        miapp.InternalLog.log('checkConnection','without Cordova but online ? '+bCon);
    }
    else {

        var networkState = navigator.connection.type;
        var states = {};
        states[Connection.UNKNOWN]  = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI]     = 'WiFi connection';
        states[Connection.CELL_2G]  = 'Cell 2G connection';
        states[Connection.CELL_3G]  = 'Cell 3G connection';
        states[Connection.CELL_4G]  = 'Cell 4G connection';
        states[Connection.CELL]     = 'Cell generic connection';
        states[Connection.NONE]     = 'No network connection';
        miapp.InternalLog.log('checkConnection','Cordova Connection type: ' + states[networkState]);
        bCon = (networkState != Connection.NONE);
    }
    return bCon;
}



function getUrlVars(ihref)
{
	var href = ihref;
	if(miapp.isUndefined(href) || !href) href = window.location.href;

    miapp.InternalLog.log('getUrlVars','href:'+href);

    var vars = [], hash;
    var hashes = href.slice(href.indexOf('#') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function SHA256(s){

    if (s.length === 0) return '';
	var chrsz   = 8;
	var hexcase = 0;

	function safe_add (x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}

	function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
	function R (X, n) { return ( X >>> n ); }
	function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
	function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
	function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
	function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
	function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
	function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

	function core_sha256 (m, l) {
        var K = [0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2];
        var HASH = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19];
		var W = new Array(64);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;

		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;

		for ( i = 0; i<m.length; i+=16 ) {
			a = HASH[0];
			b = HASH[1];
			c = HASH[2];
			d = HASH[3];
			e = HASH[4];
			f = HASH[5];
			g = HASH[6];
			h = HASH[7];

			for ( j = 0; j<64; j++) {
				if (j < 16) W[j] = m[j + i];
				else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

				T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
				T2 = safe_add(Sigma0256(a), Maj(a, b, c));

				h = g;
				g = f;
				f = e;
				e = safe_add(d, T1);
				d = c;
				c = b;
				b = a;
				a = safe_add(T1, T2);
			}

			HASH[0] = safe_add(a, HASH[0]);
			HASH[1] = safe_add(b, HASH[1]);
			HASH[2] = safe_add(c, HASH[2]);
			HASH[3] = safe_add(d, HASH[3]);
			HASH[4] = safe_add(e, HASH[4]);
			HASH[5] = safe_add(f, HASH[5]);
			HASH[6] = safe_add(g, HASH[6]);
			HASH[7] = safe_add(h, HASH[7]);
		}
		return HASH;
	}

	function str2binb (str) {
		var bin = Array();
		var mask = (1 << chrsz) - 1;
		for(var i = 0; i < str.length * chrsz; i += chrsz) {
			bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
		}
		return bin;
	}

	function Utf8Encode(string) {
		if (string.length === 0) return string;


		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	}

	function binb2hex (binarray) {
		var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
		var str = "";
		for(var i = 0; i < binarray.length * 4; i++) {
			str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
			hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
		}
		return str;
	}

	s = Utf8Encode(s);
	return binb2hex(core_sha256(str2binb(s), s.length * chrsz));

}

var miappTranslateDatesToPxSize = function(date_start, date_end, totalSize) {
    var date1 = date_start;
    if (typeof date1 == 'string') date1 = miappDateParse(date_start);
    if (!date1) return totalSize;// date_start is invalid

    var date2 = date_end;
    if (typeof date2 == 'string') date2 = miappDateParse(date_end);
    if (!date2) return totalSize;// date_end is invalid

    var milliseconds = date2.getTime() - date1.getTime();
    if (milliseconds < 0) return totalSize; // date_end is before date_start

    var days = milliseconds / 1000 / 86400;
    // TODO : Calendar does not yet support events over many days => limit duration to 1 day.
    if (days > 1) days = 1;

    return Math.round(days * totalSize);
};

var miappTranslateDateToPx = function(date, totalSize) {
    var date1 = date;
    if (typeof date1 == 'string') date1 = miappDateParse(date);
    if (!date1) return 0;// date is invalid

    var days = (date1.getHours()*60 + date1.getMinutes()) / 1440;

    return Math.round(days * totalSize);
};

// Higher-order functions (functions that operate on functions)

/**
 * Create a new function that passes its arguments to f and returns the logical negation of f's return value.
 *
 * @param f
 * @returns {Function}
 */
miapp.not = function(f) {
    return function () {
        var result = f.apply(this, arguments);
        return !result;
    };
};

/**
 * Create a new function that expects an array argument and applies f to each element,
 * returning the array of return values.
 *
 * @param f
 * @returns {Function}
 */
// Contrast this with the map() function from earlier.
miapp.mapper = function(f) {
    return function(a) {
        return map(a, f);
    };
};

/**
 * Create a new function which cache its results based on its arguments string representations
 *
 * @param f idempotent function keyed on its arguments string representations
 * @returns {Function}
 */
miapp.memoize = function(f) {
    var cache = {}; // Value cache stored in the closure.
    return function () {
        // Create a string version of the arguments to use as a cache key.
        var key = arguments.length + Array.prototype.join.call(arguments, ",");
        if (key in cache) return cache.key;
        else {
          cache.key = f.apply(this, arguments);
          return cache.key;
        }
    };
};

/*
// Note that when we write a recursive function that we will be memoizing,
// we typically want to recurse to the memoized version, not the original.
var factorial = miapp.memoize(function(n) {
    return (n <= 1) ? 1 : n * factorial(n-1);
});
factorial(5) // => 120. Also caches values for 4, 3, 2 and 1.
 */

// Helper functions

/**
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is overwritten.
 * This function does not handle getters and setters or copy attributes.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.extend = function(o, p) {
    for (var prop in p) { // For all props in p.
        o[prop] = p[prop]; // Add the property to o.
    }
    return o;
};

/**
 * Copy the enumerable properties of p to o, and return o.
 * If o and p have a property by the same name, o's property is left alone.
 * This function does not handle getters and setters or copy attributes.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.merge = function(o, p) {
    for (var prop in p) { // For all props in p.
        if (o.hasOwnProperty(prop)) continue; // Except those already in o.
        o[prop] = p[prop]; // Add the property to o.
    }
    return o;
};

/**
 * Remove properties from o if there is not a property with the same name in p.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.restrict = function(o, p) {
    for (var prop in o) { // For all props in o
        if (!(prop in p)) delete o[prop]; // Delete if not in p
    }
    return o;
};

/**
 * For each property of p, delete the property with the same name from o.
 * Return o.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.subtract = function(o, p) {
    for (var prop in p) { // For all props in p
        delete o[prop]; // Delete from o (deleting a nonexistent prop is harmless)
    }
    return o;
};

/**
 * Return a new object that holds the properties of both o and p.
 * If o and p have properties by the same name, the values from o are used.
 * Return new object.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.union = function(o, p) {
    return miapp.extend(miapp.extend({}, o), p);
};

/**
 * Return a new object that holds only the properties of o that also appear in p.
 * This is something like the intersection of o and p, but the values of the properties in p are discarded.
 *
 * @param o
 * @param p
 * @returns {*}
 */
miapp.intersection = function(o, p) {
    return miapp.restrict(miapp.extend({}, o), p);
};

/**
 * Return an array that holds the names of the enumerable own properties of o.
 *
 * @param o
 * @returns {Array}
 */
miapp.keys = function(o) {
    if (typeof o !== "object") throw new TypeError();
    var result = [];
    for (var prop in o) {
        if (o.hasOwnProperty(prop)) {
            result.push(prop);
        }
    }
    return result;
};

/**
 * Create a new object that inherits properties from the prototype object p.
 * It uses the ECMAScript 5 function Object.create() if it is defined,
 * and otherwise falls back to an older technique.
 *
 * @param proto
 * @param props
 * @returns {*}
 */
miapp.create = function(proto, props) {
    if (proto === null) throw new TypeError();
    if (Object.create) {
        return Object.create(proto, props);
    }
    var t = typeof proto;
    if (t !== "object" && t !== "function") throw new TypeError();
    function F() {} // dummy constructor function.
    F.prototype = proto;
    var o = new F();
    return miapp.extend(o, props);
};

/**
 * Determine if a number is even
 *
 * @param x
 * @returns {boolean}
 */
miapp.even = function(x) {
    return x % 2 === 0;
};

/**
 * Determine if a number is odd
 *
 * @param x
 * @returns {boolean}
 */
miapp.odd = miapp.not(miapp.even);

/**
 * Loop via Array.forEach method.
 * If the function passed to foreach() throws miapp.foreach.break, the loop will terminate early.
 *
 * @param a array object
 * @param f callback function as first argument in Array.forEach()
 * @param t thisObject as second argument in Array.forEach()
 * @returns {boolean}
 */
miapp.foreach = function(a, f, t) {
    try {
        a.forEach(f, t);
    } catch (e) {
        if (e === miapp.foreach.break) return;
        throw e;
    }
};
miapp.foreach.break = new Error("StopIteration");


var miapp;
if (!miapp) miapp = {};

function successHandler(data) {
    miapp.InternalLog.log('Analytics', "initialization success : "+data);
}
function errorHandler(data) {
    miapp.InternalLog.log('Analytics', "initialization pb : "+data);
}


/**
 * Usage analytics module : (based on Google, ...)
 */
miapp.Analytics = (function() {
    'use strict';

    var mAnalyticsLS = 'miapp.Analytics';
    var mAnalyticsFunctionnalitiesLS = 'miapp.Analytics.functionalities';


	function Analytics(localStorage, googleAnalytics_UA_ID) {

        this.localStorage = null;
        if (miapp.isDefined(localStorage) && localStorage)
          this.localStorage = localStorage;

        this.mAnalyticsArray = [];
        this.mAnalyticsFunctionnalitiesArray = [];
        if (this.localStorage) {
            this.mAnalyticsArray = this.localStorage.get(mAnalyticsLS, this.mAnalyticsArray);
            this.mAnalyticsFunctionnalitiesArray = this.localStorage.get(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray);
        }
        //this.uuid = '';
        //this.isDemo = false;
        //this.env = 'P';
        this.vid = 'vid_undefined';
        this.uid = 'uid_undefined';
        this.initDone = false;
        this.bEnabled = true;
        this.googleAnalytics_UA_ID = googleAnalytics_UA_ID; // GA UA-XXXXXXXX-X
        this.gaQueue = null;// GA official queue
        this.gaPanalytics = null; // used ? todelete ?
        this.gaPlugin = null; // GAPlugin queue
	}

    // Public API
    Analytics.prototype.init = function() {
        if (this.initDone) return;

        // GA Official queue
        if(typeof _gaq !== 'undefined') {
          miapp.InternalLog.log('Analytics', 'googleAnalytics official launched.');
          this.gaQueue = _gaq || [];
          this.gaQueue.push(['_setAccount', this.googleAnalytics_UA_ID]);
          this.gaQueue.push(['_trackPageview']);
        }
        else {miapp.InternalLog.log('Analytics', 'googleAnalytics not defined.');}

        // Plugin ? used ?
        /*if(typeof analytics !== 'undefined') {
            console.log('srvAnalytics', "GA analytics? launched.");
            this.gaPanalytics = analytics;
            analytics.startTrackerWithId(this.googleAnalytics_UA_ID);
        }*/

        // GAPlugin
        if (typeof window.plugins !== 'undefined') {
            if(typeof window.plugins.gaPlugin !== 'undefined') {
                miapp.InternalLog.log('Analytics', "GAPlugin launched.");
                this.gaPlugin = window.plugins.gaPlugin;
                this.gaPlugin.init(successHandler, errorHandler, this.googleAnalytics_UA_ID, 10);
            }
        }

        this.initDone = true;
    };

    /*Analytics.prototype.setDemo = function(isDemo) {
        this.isDemo = isDemo;
    };*/

    Analytics.prototype.setVid = function(vid) {
        this.vid = vid;
        miapp.InternalLog.log('Analytics', 'set vid ' + this.vid);
    };
    Analytics.prototype.setUid = function(uid) {
        miapp.InternalLog.log('Analytics', 'set uid ' + uid);
        if (!uid || uid === '') return;
        this.uid = uid;
    };
    Analytics.prototype.setEnabled = function(enable) {
        this.bEnabled = (enable === true);
        miapp.InternalLog.log('Analytics', 'set enabled ' + this.bEnabled);
    };


    // 1)  category - This is the type of event you are sending :
    //          this.vid(14XXX - VERSION) + category(Once, Uses, Interest)
    // 2)  eventAction - This is the type of event you are sending :
    //          category(Once, Uses, Interest) + action(Login, Contact Creation, Meeting Show ...)
    // 3)  eventLabel - A label that describes the event :
    //          this.uid(user email)
    // 4)  eventValue - An application defined integer value :
    //          value(1 .. N)
    //
    //
    // 1)  category - This is the type of event you are sending :
    //          this.vid(14XXX - VERSION) + category(Once, Uses, Interest)

    Analytics.prototype.add = function(category, action, value) {

        if (!this.bEnabled || !category || !action) return;

        //Check <action> functionnalities if Once.
        var shouldBeTrackedAsEvent = true;
        if (category == 'Once') {
            for (var i = 0; i < this.mAnalyticsFunctionnalitiesArray.length && shouldBeTrackedAsEvent; i++) {
                if (this.mAnalyticsFunctionnalitiesArray[i] === action) {
                    shouldBeTrackedAsEvent = false;
                }
            }
            if (shouldBeTrackedAsEvent) this.mAnalyticsFunctionnalitiesArray.push(action);
        }
        miapp.InternalLog.log('Analytics', 'shouldBeTrackedAsEvent ?' + shouldBeTrackedAsEvent);

        //Store event & view
        var paramEvent = {
            vid : this.vid,
            uid : this.uid,
            type : 'event',
            category: category,
            action : action,
            value : value || 1
        };
        var paramView = {
            vid : this.vid,
            uid : this.uid,
            type : 'view',
            category: category,
            action : action,
            value : value || 1
        };

        // Push arr into message queue to be stored in local storage
        miapp.InternalLog.log('Analytics', 'add ' + paramEvent.toString());
        if (shouldBeTrackedAsEvent) this.mAnalyticsArray.push(paramEvent);
        this.mAnalyticsArray.push(paramView);
        if (this.localStorage) this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray);
        if (this.localStorage) this.localStorage.set(mAnalyticsFunctionnalitiesLS, this.mAnalyticsFunctionnalitiesArray);

        // online, we launch events
        if (checkConnection()) this.run();
	};

	Analytics.prototype.run = function() {

      if (!this.bEnabled) return;
      miapp.InternalLog.log('Analytics', 'run - pushing ' + this.mAnalyticsArray.length + ' elements');
      //if (this.uuid == '') {
      //    this.uuid = (window.device) ? window.device.uuid : window.location.hostname;
      //}
      var bOK = true;

      try {
            for(var i=0; i<this.mAnalyticsArray.length; i++) {
                    var param = this.mAnalyticsArray[i];
                    if(param.type == 'view') {
                        // this.vid(14XXX - VERSION) + category(Once, Uses, Interest) + action(Login, Contact Creation, Meeting Show ...)
                        var url = '' + this.vid + ' - ' + param.category + ' - ' + param.action;
                        miapp.InternalLog.log('Analytics', 'track view ' + url);
                        if (this.gaQueue) this.gaQueue.push(['_trackPageview', url]);
                        if (this.gaPanalytics) this.gaPanalytics.trackView(url);
                        if (this.gaPlugin) this.gaPlugin.trackPage( successHandler, errorHandler, url);
                    } else  // if(param.type == 'event')
                    {
                        // cat : this.vid(14XXX - VERSION) + category(Once, Uses, Interest)
                        // act : category(Once, Uses, Interest) + action(Login, Contact Creation, Meeting Show ...)
                        var cat = this.vid +' - '+ param.category;
                        var act = param.category +' - '+ param.action;
                        var lab = param.uid;
                        var val = param.value;
                        miapp.InternalLog.log('Analytics', 'track event ' + cat + ', ' + act + ', ' + lab + ', ' + val);
                        if (this.gaQueue) this.gaQueue.push(['_trackEvent', cat, act, lab, val]);
                        //this.gaPanalytics.trackEvent(param.category, param.action, param.mode);
                        if (this.gaPanalytics) this.gaPanalytics.trackEvent(cat, act, lab, val);
                        if (this.gaPlugin) this.gaPlugin.trackEvent(successHandler, errorHandler, cat, act, lab, val);
                    }
            }
        }
        catch(e) {
              miapp.ErrorLog.log('Analytics', ' run pb : ' + miapp.formatError(e));
              bOK = false;
        }

        if (bOK) {
          this.mAnalyticsArray = [];
          if (this.localStorage) {
                    this.localStorage.set(mAnalyticsLS, this.mAnalyticsArray);
                }
        }

	};

    return Analytics;
})();

'use strict';

/**
 * Remove from list the last object having the same id.dbid attribute than dbid
 *
 * @param list Array of objects having id.dbid attribute comparable to dbid
 * @param dbid
 * @return {*} Array of deleted item or false
 */
function removeObjectFromList(list, dbid) {
    return removeSubKeyFromList(list, 'id', 'dbid', dbid);
}

/**
 * Replace in list the last object having the same id.dbid attribute
 *
 * @param list Array of objects having id.dbid attribute
 * @param dbid
 * @param object New object replacing the old one
 * @return {*} Array of replaced item or false
 */
function replaceObjectFromList(list, dbid, object) {
    return replaceSubKeyFromList(list, 'id', 'dbid', dbid, object);
}

/**
 * Add in list the argument object if none has the same id.dbid attribute
 *
 * @param list Array of objects having id.dbid attribute comparable to dbid
 * @param object New object to add
 * @return {boolean} True if added or false if already exists in list
 */
function addObjectToList(list, object) {
    return addSubKeyToList(list, 'id', 'dbid', object);
}

/**
 * Check if one object in list has the same id.dbid attribute as dbid and return it
 *
 * @param list Array of objects having id.dbid attribute comparable to dbid
 * @param dbid
 * @return {*} Object if exists or false if none exists in list
 */
function getObjectFromList(list, dbid) {
    return getSubKeyFromList(list, 'id', 'dbid', dbid);
}

/**
 * Remove from list the last object having the same dbid attribute as dbid
 *
 * @param list Array of objects having dbid attribute comparable to dbid
 * @param dbid
 * @return {*} Array of deleted item or false
 */
function removeLinkFromList(list, dbid) {
    return removeKeyFromList(list, 'dbid', dbid);
}

/**
 * Replace in list the last object having the same dbid attribute as dbid
 *
 * @param list Array of objects having dbid attribute comparable to dbid
 * @param dbid
 * @param object New object replacing the old one
 * @return {*} Array of replaced item or false
 */
function replaceLinkFromList(list, dbid, object) {
    return replaceKeyFromList(list, 'dbid', dbid, object);
}

/**
 * Add in list the argument object if none has the same dbid attribute as dbid
 *
 * @param list Array of objects having dbid attribute comparable to dbid
 * @param object New object to add
 * @return {boolean} True if added or false if already exists in list
 */
function addLinkToList(list, object) {
    return addKeyToList(list, 'dbid', object);
}

/**
 * Check if one object in list has the same dbid attribute as dbid and return it
 *
 * @param list Array of objects having dbid attribute comparable to dbid
 * @param dbid
 * @return {*} Object if exists or false if none exists in list
 */
function getLinkFromList(list, dbid) {
    return getKeyFromList(list, 'dbid', dbid);
}

/**
 * Remove from list the last object having the same id attribute as id
 *
 * @param list Array of objects having id attribute comparable to id
 * @param id
 * @return {*} Array of deleted item or false
 */
function removeIdFromList(list, id) {
    return removeKeyFromList(list, 'id', id);
}

/**
 * Replace in list the last object having the same id attribute as id
 *
 * @param list Array of objects having id attribute comparable to id
 * @param id
 * @param object New object replacing the old one
 * @return {*} Array of replaced item or false
 */
function replaceIdFromList(list, id, object) {
    return replaceKeyFromList(list, 'id', id, object);
}

/**
 * Add in list the argument object if none has the same id attribute as id
 *
 * @param list Array of objects having id attribute comparable to id
 * @param object New object to add
 * @return {boolean} True if added or false if already exists in list
 */
function addIdToList(list, object) {
    return addKeyToList(list, 'id', object);
}

/**
 * Check if one object in list has the same id attribute as id and return it
 *
 * @param list Array of objects having id attribute comparable to id
 * @param id
 * @return {*} Object if exists or false if none exists in list
 */
function getIdFromList(list, id) {
    return getKeyFromList(list, 'id', id);
}

/**
 * Remove from list the last object having the same key attribute as value
 *
 * @param list Array of objects having key attribute comparable to value
 * @param {string} key
 * @param value
 * @return {*} Array of deleted item or false
 */
function removeKeyFromList(list, key, value) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i][key] == value) {
            return list.splice(i, 1); // remove from array
        }
    }
    return false;
}

/**
 * Replace in list the last object having the same key attribute as value
 *
 * @param list Array of objects having key attribute comparable to value
 * @param {string} key
 * @param value
 * @param object New object replacing the old one
 * @return {*} Array of replaced item or false
 */
function replaceKeyFromList(list, key, value, object) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i][key] == value) {
            return list.splice(i, 1, object); // remove from array and replace by the new object
        }
    }
    return false;
}

/**
 * Add in list the argument object if none has the same key attribute
 *
 * @param list Array of objects having key attribute
 * @param {string} key
 * @param object New object to add
 * @return {boolean} True if added or false if already exists in list
 */
function addKeyToList(list, key, object) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i][key] == object[key]) {
            return false;
        }
    }
    list.push(object);
    return true;
}

/**
 * Check if one object in list has the same key attribute as value and return it
 *
 * @param list Array of objects having key attribute comparable to value
 * @param {string} key
 * @param value
 * @return {*} Object if exists or false if none exists in list
 */
function getKeyFromList(list, key, value) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i][key] == value) {
            return list[i];
        }
    }
    return false;
}

/**
 * Remove from list the last object having the same sub.key attribute as value
 *
 * @param list Array of objects having sub.key attribute comparable to value
 * @param {string} sub
 * @param {string} key
 * @param value
 * @return {*} Array of deleted item or false
 */
function removeSubKeyFromList(list, sub, key, value) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (a4p.isDefined(list[i][sub]) && (list[i][sub][key] == value)) {
            return list.splice(i, 1); // remove from array
        }
    }
    return false;
}

/**
 * Replace in list the last object having the same sub.key attribute as value
 *
 * @param list Array of objects having sub.key attribute comparable to value
 * @param {string} sub
 * @param {string} key
 * @param value
 * @param object New object replacing the old one
 * @return {*} Array of replaced item or false
 */
function replaceSubKeyFromList(list, sub, key, value, object) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (a4p.isDefined(list[i][sub]) && (list[i][sub][key] == value)) {
            return list.splice(i, 1, object); // remove from array and replace by the new object
        }
    }
    return false;
}

/**
 * Add in list the argument object if none has the same sub.key attribute
 *
 * @param list Array of objects having sub.key attribute
 * @param {string} sub
 * @param {string} key
 * @param object New object to add
 * @return {boolean} True if added or false if already exists in list
 */
function addSubKeyToList(list, sub, key, object) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (a4p.isDefined(list[i][sub]) && (list[i][sub][key] == object[sub][key])) {
            return false;
        }
    }
    list.push(object);
    return true;
}

/**
 * Check if one object in list has the same sub.key attribute as value and return it
 *
 * @param list Array of objects having sub.key attribute comparable to value
 * @param {string} sub
 * @param {string} key
 * @param value
 * @return {*} Object if exists or false if none exists in list
 */
function getSubKeyFromList(list, sub, key, value) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (a4p.isDefined(list[i][sub]) && (list[i][sub][key] == value)) {
            return list[i];
        }
    }
    return false;
}

/**
 * Remove from list the last object being equal to value
 *
 * @param list Array of objects comparable to value
 * @param value
 * @return {*} Array of deleted item or false
 */
function removeValueFromList(list, value) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] == value) {
            return list.splice(i, 1); // remove from array
        }
    }
    return false;
}

/**
 * Replace in list the last object being equal to oldValue.
 * Beware, this can insert duplicates in the list !
 *
 * @param list Array of objects comparable to oldValue
 * @param oldValue
 * @param newValue New object replacing the old one
 * @return {*} Array of replaced item or false
 */
function replaceValueFromList(list, oldValue, newValue) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] == oldValue) {
            return list.splice(i, 1, newValue); // remove from array and replace by the new object
        }
    }
    return false;
}

/**
 * Add in list the value if none equals value
 *
 * @param list Array of objects comparable to value
 * @param value New value to add
 * @return {boolean} True if added or false if already exists in list
 */
function addValueToList(list, value) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] == value) {
            return false;
        }
    }
    list.push(value);
    return true;
}

/**
 * Check if one value in list has the same value
 *
 * @param list Array of objects comparable to value
 * @param value
 * @return {boolean} True if exists or false if none exists in list
 */
function isValueInList(list, value) {
    for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] == value) {
            return true;
        }
    }
    return false;
}



// Namespace miapp
var miapp;
if (!miapp) miapp = {};

miapp.Base64 = (function () {
'use strict';

    var Base64 = {};

    // Public API

    /**
     * Encodes string to Base64 string
     */
    Base64.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        //input = utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                keyStr.charAt(enc3) + keyStr.charAt(enc4);

        }

        return output;
    };

    Base64.encodeFromUint8Array = function (input) {
        var nMod3, sB64Enc = "";
        for (var nLen = input.length, nUint24 = 0, nIdx = 0; nIdx < nLen; nIdx++) {
            nMod3 = nIdx % 3;
            if (nIdx > 0 && (nIdx * 4 / 3) % 76 === 0) {
                sB64Enc += "\r\n";
            }
            nUint24 |= input[nIdx] << (16 >>> nMod3 & 24);
            if (nMod3 === 2 || input.length - nIdx === 1) {
                sB64Enc += String.fromCharCode(uint6ToB64(nUint24 >>> 18 & 63),
                    uint6ToB64(nUint24 >>> 12 & 63),
                    uint6ToB64(nUint24 >>> 6 & 63),
                    uint6ToB64(nUint24 & 63));
                nUint24 = 0;
            }
        }
        return sB64Enc.replace(/A(?=A$|$)/g, "=");
    };

    /**
     * Decodes string from Base64 string
     */
    Base64.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        //output = utf8_decode(output);

        return output;
    };

    Base64.decodeToUint8Array = function (input) {
        var nBlocksSize = 1;// for ASCII, binary strings or UTF-8-encoded strings
        //var nBlocksSize = 2;// for UTF-16 strings
        //var nBlocksSize = 4;// for UTF-32 strings
        var sB64Enc = input.replace(/[^A-Za-z0-9\+\/]/g, ""),
            nInLen = sB64Enc.length,
            nOutLen = nBlocksSize ? Math.ceil((nInLen * 3 + 1 >> 2) / nBlocksSize) * nBlocksSize : nInLen * 3 + 1 >> 2,
            taBytes = new Uint8Array(nOutLen);
        for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
            nMod4 = nInIdx & 3;
            nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
            if (nMod4 === 3 || nInLen - nInIdx === 1) {
                for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
                    taBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
                }
                nUint24 = 0;
            }
        }
        return taBytes;
    };

    // Private API
    // helper functions and variables hidden within this function scope

    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function uint6ToB64(nUint6) {
        return nUint6 < 26 ?
            nUint6 + 65
            : nUint6 < 52 ?
            nUint6 + 71
            : nUint6 < 62 ?
            nUint6 - 4
            : nUint6 === 62 ?
            43
            : nUint6 === 63 ?
            47
            :
            65;
    }

    function b64ToUint6(nChr) {
        return nChr > 64 && nChr < 91 ?
            nChr - 65
            : nChr > 96 && nChr < 123 ?
            nChr - 71
            : nChr > 47 && nChr < 58 ?
            nChr + 4
            : nChr === 43 ?
            62
            : nChr === 47 ?
            63
            :
            0;
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Base64;
})(); // Invoke the function immediately to create this class.

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Bezier curve drawer.
 */
a4p.BezierDrawer = (function () {
    function BezierDrawer(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.begin = function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        this.add = function (p0, q0, q1, p1) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = "cyan";
            this.ctx.lineWidth = "6";
            this.ctx.moveTo(p0.x, p0.y);
            this.ctx.bezierCurveTo(q0.x, q0.y, q1.x, q1.y, p1.x, p1.y);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.arc(p0.x, p0.y, 2, 0, 2 * Math.PI);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.arc(q0.x, q0.y, 2, 0, 2 * Math.PI);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.arc(q1.x, q1.y, 2, 0, 2 * Math.PI);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.arc(p1.x, p1.y, 2, 0, 2 * Math.PI);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.moveTo(p0.x, p0.y);
            this.ctx.lineTo(q0.x, q0.y);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.moveTo(q1.x, q1.y);
            this.ctx.lineTo(p1.x, p1.y);
            this.ctx.stroke();

        };
        this.end = function () {
        };
    }

    return BezierDrawer;
})();

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Bezier curve interpolator.
 */
a4p.BezierInterpolator = (function () {
    function BezierInterpolator(scale) {
        var p0, q0, q1, p1;
        var samplePoint0;
        var samplePoint1;
        var sample10X, sample10Y, sampleDist10;

        this.listeners = [];
        /**
         * Ratio q0-p1/p0-p1 (a sort of tension)
         * @type {Number}
         */
        this.sampleScale = scale || 0.33;
        /**
         * Interpolation result of points entered via add() method
         * @type {Array}
         */
        this.controlPoints = [];
        /**
         * Number of bezier curves in controlPoints array ((controlPoints.length - 1)/3)
         * Each bezier curve needs 2 sample points (segment) and 2 control points (tangents and tension).
         * The second sample point of a bezier curve is also the first sample point for next bezier curve.
         * @type {Number}
         */
        this.nbCurve = 0;

        this.begin = function () {
            this.controlPoints = [];
            this.nbCurve = 0;
            p0 = null;
            q0 = null;
            q1 = null;
            p1 = null;
            samplePoint0 = null;
            samplePoint1 = null;
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].begin();
            }
        };

        this.add = function (x, y, timeStamp) {
            if (samplePoint0 == null) {
                samplePoint0 = {x: x, y: y};
                return;
            }
            if (samplePoint1 == null) {
                if ((x == samplePoint0.x) && (y == samplePoint0.y)) return;

                samplePoint1 = {x: x, y: y};

                sample10X = samplePoint1.x - samplePoint0.x;
                sample10Y = samplePoint1.y - samplePoint0.y;
                sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y);

                p0 = {x: samplePoint0.x, y: samplePoint0.y};
                q0 = {
                    x: samplePoint0.x + this.sampleScale * sample10X,
                    y: samplePoint0.y + this.sampleScale * sample10Y
                };
                this.controlPoints.push(p0);
                this.controlPoints.push(q0);
                return;
            }
            if ((x == samplePoint1.x) && (y == samplePoint1.y)) return;

            var tangentX = x - samplePoint0.x;
            var tangentY = y - samplePoint0.y;
            var tangentDist = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
            q1 = {
                x: samplePoint1.x - this.sampleScale * tangentX * sampleDist10 / tangentDist,
                y: samplePoint1.y - this.sampleScale * tangentY * sampleDist10 / tangentDist
            };
            p1 = {x: samplePoint1.x, y: samplePoint1.y};
            this.controlPoints.push(q1);
            this.controlPoints.push(p1);
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].add(p0, q0, q1, p1);
            }

            sample10X = x - samplePoint1.x;
            sample10Y = y - samplePoint1.y;
            sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y);

            p0 = p1;
            q0 = {
                x: samplePoint1.x + this.sampleScale * tangentX * sampleDist10 / tangentDist,
                y: samplePoint1.y + this.sampleScale * tangentY * sampleDist10 / tangentDist
            };
            this.controlPoints.push(q0);
            samplePoint0 = samplePoint1;
            samplePoint1 = {x: x, y: y};
            this.nbCurve++;
        };

        this.end = function () {
            if (this.controlPoints.length > 1) {
                q1 = {
                    x: samplePoint1.x - this.sampleScale * sample10X,
                    y: samplePoint1.y - this.sampleScale * sample10Y
                };
                p1 = {x: samplePoint1.x, y: samplePoint1.y};
                this.controlPoints.push(q1);
                this.controlPoints.push(p1);
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i].add(p0, q0, q1, p1);
                }
                this.nbCurve++;
            }
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].end();
            }
        };
    }

    BezierInterpolator.prototype.size = function () {
        return this.nbCurve;
    };

    /**
     * Adding a listener to draw or use the bezier curves interpolated by BezierInterpolator.
     * Each listener must implement begin() function : called at start of each sample.
     * Each listener must implement add(p0, q0, q1, p1) function : called for each significant position.
     * Each listener must implement end() function : called at end of each sample.
     *
     * @param {object} listener Drawer
     */
    BezierInterpolator.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };

    return BezierInterpolator;
})();

function Bridge() {
    // Does nothing
}


Bridge.prototype.setUrl = function (url, email, appId, right) {
    a4p.InternalLog.log('bridge.js', 'setUrl');
    if (!window.device) return;
    if (window.device.platform === "Android") {
        cordova.exec(null, null, "Bridge", "setUrl", [url, email, appId, right]);
    }
};

Bridge.prototype.getUrl = function (email, success, fail) {
    a4p.InternalLog.log('bridge.js', 'getUrl');
    if (!window.device) {
        return null;
    }
    if (window.device.platform === "Android") {
        a4p.InternalLog.log('bridge.js', 'exec getUrl');
        return cordova.exec(success, fail, "Bridge", "getUrl", [email]);
    } else {
        return null;
    }
};

if (!window.plugins) {
    window.plugins = {};
}
window.plugins.bridge = new Bridge();
//return window.plugins.bridge;
/*
 Bridge.install = function()
 {
 if(!window.plugins)
 {
 window.plugins = {
 };
 }
 window.plugins.bridge = new Bridge();
 return window.plugins.bridge;
 };
 */

'use strict';

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

/**
 * Management of browser capabilities
 */
miapp.BrowserCapabilities = (function (navigator, window, document) {
    var capacities = {vendor: '', cssVendor: ''};

    function prefixStyle(style) {
        if (capacities.vendor === '') return style;
        style = style.charAt(0).toUpperCase() + style.substr(1);
        return capacities.vendor + style;
    }

    var dummyStyle = document.createElement('div').style;
    var vendors = 't,webkitT,MozT,msT,OT'.split(',');
    var nbVendors = vendors.length;
    for (var i = 0; i < nbVendors; i++) {
        var t = vendors[i] + 'ransform';
        if (t in dummyStyle) {
            capacities.vendor = vendors[i].substr(0, vendors[i].length - 1);
            capacities.cssVendor = '-' + capacities.vendor.toLowerCase() + '-';
            break;
        }
    }

    capacities.transform = prefixStyle('transform');
    capacities.transitionProperty = prefixStyle('transitionProperty');
    capacities.transitionDuration = prefixStyle('transitionDuration');
    capacities.transformOrigin = prefixStyle('transformOrigin');
    capacities.transitionTimingFunction = prefixStyle('transitionTimingFunction');
    capacities.transitionDelay = prefixStyle('transitionDelay');

    capacities.isAndroid = (/android/gi).test(navigator.appVersion);
    capacities.isIDevice = (/iphone|ipad/gi).test(navigator.appVersion);
    capacities.isTouchPad = (/hp-tablet/gi).test(navigator.appVersion);
    capacities.isPhantom = (/phantom/gi).test(navigator.userAgent);
    //capacities.hasTouch = (('ontouchstart' in window) || ('createTouch' in document)) && !capacities.isTouchPad && !capacities.isPhantom;
    capacities.hasTouch = (('ontouchstart' in window) || ('createTouch' in document)) && (capacities.isAndroid || capacities.isIDevice) && !capacities.isPhantom;
    capacities.has3d = prefixStyle('perspective') in dummyStyle;
    capacities.hasTransform = (capacities.vendor != '');
    capacities.hasTransitionEnd = prefixStyle('transition') in dummyStyle;

    capacities.online = navigator.onLine;

    capacities.isConnectionOnline = function () {
        // web browser
        if (navigator && typeof navigator.onLine === 'boolean') return navigator.onLine;

        //cordova
        if (navigator && navigator.connection && Connection) {
            var networkState = navigator.connection.type;

            var states = {};
            states[Connection.UNKNOWN] = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI] = 'WiFi connection';
            states[Connection.CELL_2G] = 'Cell 2G connection';
            states[Connection.CELL_3G] = 'Cell 3G connection';
            states[Connection.CELL_4G] = 'Cell 4G connection';
            states[Connection.CELL] = 'Cell generic connection';
            states[Connection.NONE] = 'No network connection';

            return (states[networkState] !== 'No network connection');
        }

        return false;
    }

    capacities.RESIZE_EVENT = 'onorientationchange' in window ? 'orientationchange' : 'resize';
    capacities.TRNEND_EVENT = (function () {
        if (capacities.vendor == '') return false;
        var transitionEnd = {
            '': 'transitionend',
            'webkit': 'webkitTransitionEnd',
            'Moz': 'transitionend',
            'O': 'otransitionend',
            'ms': 'MSTransitionEnd'
        };
        return transitionEnd[capacities.vendor];
    })();
    if (window.requestAnimationFrame) {
        //capacities.nextFrame.call(window, callback);
        capacities.nextFrame = function (callback) {
            return window.requestAnimationFrame(callback);
        };
    } else if (window.webkitRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.webkitRequestAnimationFrame(callback);
        };
    } else if (window.mozRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.mozRequestAnimationFrame(callback);
        };
    } else if (window.oRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.oRequestAnimationFrame(callback);
        };
    } else if (window.msRequestAnimationFrame) {
        capacities.nextFrame = function (callback) {
            return window.msRequestAnimationFrame(callback);
        };
    } else {
        capacities.nextFrame = function (callback) {
            return setTimeout(callback, 1);
        };
    }
    if (window.cancelRequestAnimationFrame) {
        //capacities.cancelFrame.call(window, handle);
        capacities.cancelFrame = function (handle) {
            return window.cancelRequestAnimationFrame(handle);
        };
    } else if (window.webkitCancelAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.webkitCancelAnimationFrame(handle);
        };
    } else if (window.webkitCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.webkitCancelRequestAnimationFrame(handle);
        };
    } else if (window.mozCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.mozCancelRequestAnimationFrame(handle);
        };
    } else if (window.oCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.oCancelRequestAnimationFrame(handle);
        };
    } else if (window.msCancelRequestAnimationFrame) {
        capacities.cancelFrame = function (handle) {
            return window.msCancelRequestAnimationFrame(handle);
        };
    } else {
        capacities.cancelFrame = function (handle) {
            return clearTimeout(handle);
        };
    }
    // FIX ANDROID BUG : translate3d and scale doesn't work together => deactivate translate3d (in case user uses scale) !
    capacities.translateZ = (capacities.has3d && !capacities.isAndroid) ? ' translateZ(0)' : '';

    dummyStyle = null;

    return capacities;
})(navigator, window, document);

/**
 * File functions
 **/

var gFileSystem = null;

function normalizedPath(dirPath, fileName, fileExtension) {
    'use strict';
    var filePath = dirPath;
    if (filePath.charAt(filePath.length - 1) == '/') {
        if (fileName.charAt(0) == '/') {
            filePath = filePath.substring(0, filePath.length - 1) + fileName + '.' + fileExtension;
        } else {
            filePath = filePath + fileName + '.' + fileExtension;
        }
    } else {
        if (fileName.charAt(0) == '/') {
            filePath = filePath + fileName + '.' + fileExtension;
        } else {
            filePath = filePath + '/' + fileName + '.' + fileExtension;
        }
    }
    return filePath;
}


function sanitizeFilename(name, addTimeStamp) {
    'use strict';

    a4p.InternalLog.log('a4p.file', "sanitizeFilename " + name);
    //pictureName.replace(/ /g, '_');
    var filename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

    if (addTimeStamp === true) {
        //var timestamp = ''+(new Date()).getTime();
        var timestamp = a4pDateCompactFormat(new Date());
        filename = filename + '_' + timestamp;
    }

    a4p.InternalLog.log('a4p.file', "sanitizeFilename end : " + filename);
    return filename;
}

function transferErrorMessage(fileTransferError) {
    'use strict';
    var msg = '';
    switch (fileTransferError.code) {
        case FileTransferError.FILE_NOT_FOUND_ERR:
            msg = 'File not found';
            break;
        case FileTransferError.CONNECTION_ERR:
            msg = 'Connection error';
            break;
        case FileTransferError.INVALID_URL_ERR:
            msg = 'Invalid URL error';
            break;
        default:
            msg = 'Unknown FileTransferError code (code= ' + fileTransferError.code + ', type=' + typeof(fileTransferError) + ')';
            break;
    }
    return msg;
}

var fileErrorHandler = function (e) {
    var msg = 'Unknown Error - ' + e.code;
    a4p.InternalLog.log('fileErrorHandler', e.code);

    if (e.source) {
        switch (e.code) {
            case FileTransferError.FILE_NOT_FOUND_ERR:
                msg = 'FILE_NOT_FOUND_ERR';
                break;
            case FileTransferError.INVALID_URL_ERR:
                msg = 'INVALID_URL_ERR';
                break;
            case FileTransferError.CONNECTION_ERR:
                msg = 'CONNECTION_ERR';
                break;
        }
    }
    else {

        switch (e.code) {
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = 'QUOTA_EXCEEDED_ERR';
                break;
            case FileError.NOT_FOUND_ERR:
                msg = 'NOT_FOUND_ERR';
                break;
            case FileError.SECURITY_ERR:
                msg = 'SECURITY_ERR';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'INVALID_MODIFICATION_ERR';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'INVALID_STATE_ERR';
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                msg = 'NO_MODIFICATION_ALLOWED_ERR';
                break;
            case FileError.SYNTAX_ERR:
                msg = 'SYNTAX_ERR';
                break;
            case FileError.TYPE_MISMATCH_ERR:
                msg = 'TYPE_MISMATCH_ERR';
                break;
            case FileError.PATH_EXISTS_ERR:
                msg = 'PATH_EXISTS_ERR';
                break;
        }
    }

    if (e.source) msg = msg + ' error source ' + e.source;
    if (e.target) msg = msg + ' error target ' + e.target;
    if (e.description) msg = msg + ' error description ' + e.description;

    a4p.InternalLog.log('fileErrorHandler', 'File Error: ' + msg);
    onFillCompleted(false);
    a4p.InternalLog.log('fileErrorHandler', 'onFillCompleted : false');
};


//showFileInFS
function showFileInFS(fileRelPath, fileName, fileExtension) {

    a4p.InternalLog.log('showFileInFS', fileRelPath + '  Name:' + fileName + '  Extension:' + fileExtension);

    try {

        var localPath = gFileSystem.root.fullPath;
        if (device.platform === "Android" && localPath.indexOf("file://") === 0) {
            localPath = localPath.substring(7);
        }

        var fullPath = localPath + fileRelPath + fileName;
        a4p.InternalLog.log('showFileInFS', 'get file : ' + fullPath);

        openChildBrowser(fullPath, fileExtension);
    }
    catch (e) {
        fileErrorHandler(e);
    }
}

//getFileSystem
function getFileSystem(success, arg1, arg2, arg3) {

    if (gFileSystem) {
        a4p.InternalLog.log('getFileSystem', 'allready did : launch');
        return success(arg1, arg2, arg3);
    }
    else if (window.requestFileSystem) {
        try {
            a4p.InternalLog.log('getFileSystem', 'window.requestFileSystem');
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 10 * 1024 * 1024, function (fs) {
                a4p.InternalLog.log('getFileSystem', 'get FileSystem');
                gFileSystem = fs;
                return success(arg1, arg2, arg3);
            }, fileErrorHandler);
        }
        catch (e) {
            fileErrorHandler(e);
        }
    }
    else {
        a4p.InternalLog.log('getFileSystem', 'Impossible to use file, No FileSystem !');
    }
}

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};


'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};


/**
 * Geolocation - Begin
 */

var geo_code;
var geo_city;

//Get the latitude and the longitude;
var geo_success = function (position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    geo_codeLatLng(lat, lng);
};

var geo_error = function () {
    a4p.ErrorLog.log('geo_error', "Geocoder failed");
};

var geo_codeLatLng = function (lat, lng) {

    var latlng = new google.maps.LatLng(lat, lng);
    geo_code.geocode({'latLng': latlng}, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            a4p.InternalLog.log('geo_codeLatLng', results);
            if (results[1]) {
                //formatted address
                a4p.InternalLog.log('geo_codeLatLng', results[0].formatted_address);
                geo_city = results[0].formatted_address;
                var city;
                //find country name
                for (var i = 0; i < results[0].address_components.length; i++) {
                    for (var b = 0; b < results[0].address_components[i].types.length; b++) {

                        //there are different types that might hold a city admin_area_lvl_1 usually does in come cases looking for sublocality type will be more appropriate
                        if (results[0].address_components[i].types[b] == "administrative_area_level_1") {
                            //this is the object you are looking for
                            city = results[0].address_components[i];
                            break;
                        }
                    }
                }
                //city data
                a4p.InternalLog.log('geo_codeLatLng', city.short_name + " " + city.long_name);
                //return city.short_name;
                //geo_city = city.short_name;
                geo_city = '<?php print Lang::_t("(near)",$current_user);?> ' + geo_city;
                var option = new Option(geo_city, geo_city, true, true);
                $('#rdv-header-location').append(option);
                $('#rdv-header-location').val(option);


            } else {
                a4p.InternalLog.log('geo_codeLatLng', "Geocoder No results found");
            }
        } else {
            a4p.InternalLog.log('geo_codeLatLng', "Geocoder failed due to: " + status);
        }
    });
};

var loadLocation = function () {

    geo_code = new google.maps.Geocoder();

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geo_success, geo_error);
    }
};


/**
 * Geolocation - End
 */


'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Gesture drawer.
 */
a4p.GestureDrawer = (function () {
    function GestureDrawer(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.begin = function () {
            //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        this.add = function (event) {
            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'blue';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.arc(event.x, event.y, 2, 0, 2 * Math.PI);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'blue';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.moveTo(event.x, event.y);
            if (event.line == 'W') {
                this.ctx.lineTo(event.x - event.dist, event.y);
            } else if (event.line == 'SW') {
                this.ctx.lineTo(event.x - event.dist / Math.sqrt(2), event.y + event.dist / Math.sqrt(2));
            } else if (event.line == 'S') {
                this.ctx.lineTo(event.x, event.y + event.dist);
            } else if (event.line == 'SE') {
                this.ctx.lineTo(event.x + event.dist / Math.sqrt(2), event.y + event.dist / Math.sqrt(2));
            } else if (event.line == 'E') {
                this.ctx.lineTo(event.x + event.dist, event.y);
            } else if (event.line == 'NE') {
                this.ctx.lineTo(event.x + event.dist / Math.sqrt(2), event.y - event.dist / Math.sqrt(2));
            } else if (event.line == 'N') {
                this.ctx.lineTo(event.x, event.y - event.dist);
            } else if (event.line == 'NW') {
                this.ctx.lineTo(event.x - event.dist / Math.sqrt(2), event.y - event.dist / Math.sqrt(2));
            }
            this.ctx.stroke();
        };
        this.end = function () {
        };
    }

    return GestureDrawer;
})();

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Gesture interpolator.
 */
a4p.GestureInterpolator = (function () {
    var step = Math.PI / 8;

    function GestureInterpolator() {
        var samplePoint0, samplePoint1, sample10X, sample10Y, sampleDist10, sampleAngle10, move0;

        this.listeners = [];
        /**
         * Interpolation result of points entered via add() method
         * @type {Array}
         */
        this.moves = [];
        this.lastMove = null;

        this.begin = function () {
            this.moves = [];
            this.fromIdx = 0;
            samplePoint0 = null;
            samplePoint1 = null;
            move0 = null;
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].begin();
            }
        };

        this.add = function (x, y, timeStamp) {
            if (samplePoint0 == null) {
                samplePoint0 = {x: x, y: y, timeStamp: timeStamp};
                return;
            }
            var self = this;
            if (samplePoint1 == null) {
                if ((x == samplePoint0.x) && (y == samplePoint0.y)) return;

                samplePoint1 = {x: x, y: y, timeStamp: timeStamp};

                sample10X = samplePoint1.x - samplePoint0.x;
                sample10Y = samplePoint1.y - samplePoint0.y;
                sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y);
                sampleAngle10 = Math.atan2(sample10Y, sample10X); // in ]-PI, +PI]

                move0 = {
                    x: samplePoint0.x,
                    y: samplePoint0.y,
                    timeStamp: samplePoint0.timeStamp,
                    angle: sampleAngle10,
                    dist: sampleDist10,
                    line: orientation(sampleAngle10),
                    rotate: ''
                };
                //console.log('GestureInterpolator : ' + move0.rotate + '(' + move0.line + ')');
                triggerMove(self, move0);
                return;
            }
            if ((x == samplePoint1.x) && (y == samplePoint1.y)) return;

            var oldDist = sampleDist10;
            var oldAngle = sampleAngle10;

            var tangentX = x - samplePoint0.x;
            var tangentY = y - samplePoint0.y;
            var tangentDist = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
            var tangentAngle = Math.atan2(tangentY, tangentX); // in ]-PI, +PI]
            var line = orientation(tangentAngle);
            var rotate = '';

            sample10X = x - samplePoint1.x;
            sample10Y = y - samplePoint1.y;
            sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y);
            sampleAngle10 = Math.atan2(sample10Y, sample10X); // in ]-PI, +PI]

            var newMove = false;
            if (line != move0.line) {
                var angle = angleOf(tangentAngle, move0.angle);
                var angleNbStep = angleNbStepOf(tangentAngle, move0.angle);
                rotate = rotation(angle, angleNbStep);
                //if ((this.lastMove.rotate == '') || (rotate == '') || (rotate != this.lastMove.rotate)) {
                newMove = true;
                //}
            }
            if (newMove) {
                if ((this.lastMove.rotate != '') && (rotate != this.lastMove.rotate)) {
                    // Push a line move after the end of previous rotation
                    move0 = {
                        x: move0.x,
                        y: move0.y,
                        timeStamp: move0.timeStamp,
                        angle: move0.angle,
                        dist: move0.dist,
                        line: move0.line,
                        rotate: ''
                    };
                    triggerMove(self, move0);
                }
            }
            move0 = {
                x: samplePoint1.x,
                y: samplePoint1.y,
                timeStamp: samplePoint1.timeStamp,
                angle: tangentAngle,
                dist: (oldDist + sampleDist10) / 2,
                line: line,
                rotate: rotate
            };
            //console.log('GestureInterpolator : ' + move0.rotate + '(' + move0.line + ')');
            if (newMove) {
                triggerMove(self, move0);
            }

            samplePoint0 = samplePoint1;
            samplePoint1 = {x: x, y: y, timeStamp: timeStamp};
        };

        this.end = function () {
            if (samplePoint1 != null) {
                var line = orientation(sampleAngle10);
                var rotate = '';

                var newMove = false;
                if (line != move0.line) {
                    var angle = angleOf(sampleAngle10, move0.angle);
                    var angleNbStep = angleNbStepOf(sampleAngle10, move0.angle);
                    rotate = rotation(angle, angleNbStep);
                    //if ((this.lastMove.rotate == '') || (rotate == '') || (rotate != this.lastMove.rotate)) {
                    newMove = true;
                    //}
                }
                var self = this;
                if (newMove) {
                    if ((this.lastMove.rotate != '') && (rotate != this.lastMove.rotate)) {
                        // Push a line move after the end of previous rotation
                        move0 = {
                            x: move0.x,
                            y: move0.y,
                            timeStamp: move0.timeStamp,
                            angle: move0.angle,
                            dist: move0.dist,
                            line: move0.line,
                            rotate: ''
                        };
                        triggerMove(self, move0);
                    }
                }
                move0 = {
                    x: samplePoint1.x,
                    y: samplePoint1.y,
                    timeStamp: samplePoint1.timeStamp,
                    angle: sampleAngle10,
                    dist: sampleDist10,
                    line: line,
                    rotate: rotate
                };
                //console.log('GestureInterpolator : ' + move0.rotate + '(' + move0.line + ')');
                if (newMove) {
                    triggerMove(self, move0);
                }
                // Force the last event to be a line move
                if (this.lastMove.rotate != '') {
                    // Push a line move after the last rotation
                    move0 = {
                        x: move0.x,
                        y: move0.y,
                        timeStamp: move0.timeStamp,
                        angle: move0.angle,
                        dist: move0.dist,
                        line: move0.line,
                        rotate: ''
                    };
                    triggerMove(self, move0);
                }
            }
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].end();
            }
        };

        function triggerMove(self, move) {
            self.lastMove = {line: move.line, rotate: move.rotate};
            self.moves.push({
                x: move.x,
                y: move.y,
                timeStamp: move.timeStamp,
                angle: move.angle,
                dist: move.dist,
                line: move.line,
                rotate: move.rotate
            });
            for (var i = 0; i < self.listeners.length; i++) {
                self.listeners[i].add(move);
            }
        }
    }

    /**
     * Adding a listener to draw or use the gestures interpolated by GestureInterpolator.
     * Each listener must implement begin() function : called at start of each sample.
     * Each listener must implement add(event) function : called for each significant position.
     * Each event has following attributes : x, y, timeStamp, angle, dist, line, compass.
     * Each listener must implement end() function : called at end of each sample.
     *
     * @param {object} listener Drawer
     */
    GestureInterpolator.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };

    GestureInterpolator.prototype.size = function () {
        return this.moves.length;
    };

    function orientation(angle) { // angle in ]-PI, +PI]
        if (angle > (Math.PI - step)) {
            return 'W';
        } else if (angle > (Math.PI - 3 * step)) {
            return 'SW';
        } else if (angle > (Math.PI - 5 * step)) {
            return 'S';
        } else if (angle > (Math.PI - 7 * step)) {
            return 'SE';
        } else if (angle > (Math.PI - 9 * step)) {
            return 'E';
        } else if (angle > (Math.PI - 11 * step)) {
            return 'NE';
        } else if (angle > (Math.PI - 13 * step)) {
            return 'N';
        } else if (angle > (Math.PI - 15 * step)) {
            return 'NW';
        } else {
            return 'W';
        }
    }

    function angleOf(angle1, angle0) {// angle in ]-PI, +PI]
        var angle = angle1 - angle0;
        if (angle <= -Math.PI) angle = angle + 2 * Math.PI;
        else if (angle > Math.PI) angle = angle - 2 * Math.PI;
        return angle;
    }

    function angleNbStepOf(angle1, angle0) {// angle in ]-PI, +PI]
        var nbStep = Math.round(angle1 / (2 * step)) - Math.round(angle0 / (2 * step));// nbStep in ]-8, 8]
        if (nbStep <= -4) nbStep = nbStep + 8;
        else if (nbStep > 4) nbStep = nbStep - 8;
        return nbStep;
    }

    function rotation(angle, nbStep) {// angle in ]-PI, +PI], nbStep in ]-4, 4]
        if (Math.abs(nbStep) == 1) {
            if (angle < 0) {
                return 'left';
            } else {
                return 'right';
            }
        } else {
            // Too big or too small rotation
            return '';
        }
    }

    return GestureInterpolator;
})();

'use strict';

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

miapp.Hex = (function () {

    var Hex = {};

    // Public API

    /**
     * Encodes string to Hexadecimal string
     */
    Hex.encode = function (input) {
        var output = '';
        for (var i = 0; i < input.length; i++) {
            var x = input.charCodeAt(i);
            output += hexTab.charAt((x >>> 4) & 0x0F) + hexTab.charAt(x & 0x0F);
        }
        return output;
    };

    /**
     * Decodes Hexadecimal string to string
     */
    Hex.decode = function (input) {
        var output = '';
        if (input.length % 2 > 0) {
            input = '0' + input;
        }
        for (var i = 0; i < input.length; i = i + 2) {
            output += String.fromCharCode(parseInt(input.charAt(i) + input.charAt(i + 1), 16));
        }
        return output;
    };

    var hexTab = "0123456789abcdef";

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Hex;
})(); // Invoke the function immediately to create this class.


// Namespace miapp
var miapp;
if (!miapp) miapp = {};

miapp.Json = (function($)
{
    'use strict';

    if(!(Object.toJSON || window.JSON)){
        throw new Error("Object.toJSON or window.JSON needs to be loaded before miapp.Json!");
    }

    // Constructor
    function Json()
    {
        this.version = "0.1";
    }

    // Public API

    /**
     * Encodes object to JSON string
     *
     * Do not use $.param() which causes havoc in ANGULAR.
     * See http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
     */
    Json.uriEncode = function(obj) {
        var query = '';
        var name, value, fullSubName, subName, subValue, innerObj, i;

        for (name in obj) {
            if (!obj.hasOwnProperty(name)) continue;
            value = obj[name];
            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += Json.uriEncode(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    if (!value.hasOwnProperty(subName)) continue;
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += Json.uriEncode(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null) {
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };

    /**
     * Encodes object to JSON string
     */
    Json.object2String = Object.toJSON || (window.JSON && (JSON.encode || JSON.stringify));

    /**
     * Decodes object from JSON string
     */
    Json.string2Object = (window.JSON && (JSON.decode || JSON.parse)) || function (str) {
        return String(str).evalJSON();
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Json;
})(window.$ || window.jQuery); // Invoke the function immediately to create this class.

'use strict';

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

function miappDumpData(input, maxDepth) {
    var str = "";
    if (typeof input === "object") {
        if (input instanceof Array) {
            if (maxDepth > 0) {
                str += "[\n";
                str += miappDumpArray("  ", input, maxDepth-1);
                str += "]\n";
            } else {
                str += "[Array]\n";
            }
        } else {
            if (maxDepth > 0) {
                str += "{\n";
                str += miappDumpObject("  ", input, maxDepth-1);
                str += "}\n";
            } else {
                str += "[" + typeof(input) + "]\n";
            }
        }
    } else {
        str += input + "\n";
    }
    return str;
}

function miappDumpArray(offset, input, maxDepth) {
    var str = "";
    for (var key = 0,nb = input.length; key<nb; key++) {
        if (typeof input[key] === "object") {
            if (input[key] instanceof Array) {
                if (maxDepth > 0) {
                    str += offset + key + " : [\n";
                    str += miappDumpArray(offset + "  ", input[key], maxDepth-1);
                    str += offset + "]\n";
                } else {
                    str += offset + key + " : [Array]\n";
                }
            } else {
                if (maxDepth > 0) {
                    str += offset + key + " : {\n";
                    str += miappDumpObject(offset + "  ", input[key], maxDepth-1);
                    str += offset + "}\n";
                } else {
                    str += offset + key + " : [" + typeof(input[key]) + "]\n";
                }
            }
        } else {
            str += offset + key + " : " + input[key] + "\n";
        }
    }
    return str;
}

function miappDumpObject(offset, input, maxDepth) {
    var str = "", key;
    for (key in input) {
        if (!input.hasOwnProperty(key)) continue;
        if (typeof input[key] === "object") {
            if (input[key] instanceof Array) {
                if (maxDepth > 0) {
                    str += offset + key + " : [\n";
                    str += miappDumpArray(offset + "  ", input[key], maxDepth-1);
                    str += offset + "]\n";
                } else {
                    str += offset + key + " : [Array]\n";
                }
            } else {
                if (maxDepth > 0) {
                    str += offset + key + " : {\n";
                    str += miappDumpObject(offset + "  ", input[key], maxDepth-1);
                    str += offset + "}\n";
                } else {
                    str += offset + key + " : [" + typeof(input[key]) + "]\n";
                }
            }
        } else {
            str += offset + key + " : " + input[key] + "\n";
        }
    }
    return str;
}

/**
 * Return a string format "yyyy-MM-dd HH:mm:ss" from a Number which is the result of any Date.getTime (timestamp in ms).
 * @param {Number} timestamp in ms since 1/1/1970
 * @returns {string} result
 */
function miappTimestampFormat(timestamp) {
    var date = new Date(timestamp);
    return miappPadNumber(date.getFullYear(), 4) + '-' +
        miappPadNumber(date.getMonth() + 1, 2) + '-' +
        miappPadNumber(date.getDate(), 2) + ' ' +
        miappPadNumber(date.getHours(), 2) + ':' +
        miappPadNumber(date.getMinutes(), 2) + ':' +
        miappPadNumber(date.getSeconds(), 2);
}

/**
 * Return a string format "yyyy-MM-dd HH:mm:ss" from a Date object.
 * @param {Date} date to format
 * @returns {string} result
 */
function miappDateFormat(date) {
    if (!date) return '';
    return miappPadNumber(date.getFullYear(), 4) + '-' +
        miappPadNumber(date.getMonth() + 1, 2) + '-' +
        miappPadNumber(date.getDate(), 2) + ' ' +
        miappPadNumber(date.getHours(), 2) + ':' +
        miappPadNumber(date.getMinutes(), 2) + ':' +
        miappPadNumber(date.getSeconds(), 2);
}

/**
 * Return a string format "yyMMdd_HHmmss" from a Date object.
 * @param {Date} date to format
 * @returns {string} result
 */
function miappDateCompactFormat(date) {
    if (!date) return '';
    return miappPadNumber(date.getFullYear(), 2) +
        miappPadNumber(date.getMonth() + 1, 2) +
        miappPadNumber(date.getDate(), 2) + '_' +
        miappPadNumber(date.getHours(), 2) +
        miappPadNumber(date.getMinutes(), 2) +
        miappPadNumber(date.getSeconds(), 2);
}

/**
 * Parse a date string to create a Date object
 * @param {string} date string at format "yyyy-MM-dd HH:mm:ss"
 * @returns {Number} Number resulting from Date.getTime or 0 if invalid date
 */
function miappTimestampParse(date) {
    var newDate = miappDateParse(date);
    return (newDate !== false) ? newDate.getTime() : 0;
}

/**
 * Parse a date string to create a Date object
 * @param {string} date string at format "yyyy-MM-dd HH:mm:ss"
 * @returns {Date} Date object or false if invalid date
 */
function miappDateParse(date) {
    if (!date || typeof date != 'string' || date == '') return false;
    // Date (choose 0 in date to force an error if parseInt fails)
    var yearS = parseInt(date.substr(0,4), 10) || 0;
    var monthS = parseInt(date.substr(5,2), 10) || 0;
    var dayS = parseInt(date.substr(8,2), 10) || 0;
    var hourS = parseInt(date.substr(11,2), 10) || 0;
    var minuteS = parseInt(date.substr(14,2),10) || 0;
    var secS = parseInt(date.substr(17,2),10) || 0;
    /*
    BEWARE : here are the ONLY formats supported by all browsers in creating a Date object
    var d = new Date(2011, 01, 07); // yyyy, mm-1, dd
    var d = new Date(2011, 01, 07, 11, 05, 00); // yyyy, mm-1, dd, hh, mm, ss
    var d = new Date("02/07/2011"); // "mm/dd/yyyy"
    var d = new Date("02/07/2011 11:05:00"); // "mm/dd/yyyy hh:mm:ss"
    var d = new Date(1297076700000); // milliseconds
    var d = new Date("Mon Feb 07 2011 11:05:00 GMT"); // ""Day Mon dd yyyy hh:mm:ss GMT/UTC
     */

    var newDate = new Date(yearS, monthS-1, dayS, hourS, minuteS, secS, 0);
    if ((newDate.getFullYear() !== yearS) || (newDate.getMonth() !== (monthS-1)) || (newDate.getDate() !== dayS)) {
        // Invalid date
        return false;
    }
    return newDate;
}

// @input date or string
// @return String formatted as date
function miappDateFormatObject(object) {

    var yearS = '1970';
    var monthS = '01';
    var dayS = '01';
    var hourS = "00";
    var minuteS = "00";
    var secondS = "00";
   
    if ( Object.prototype.toString.call(object) === "[object Date]" ) {
      // it is a date
      if ( isNaN(object.getTime() ) ) {  // d.valueOf() could also work
        // date is not valid
      }
      else {
        // date is valid
        yearS = ''+object.getFullYear();
        monthS = ''+(object.getMonth()+1);
        dayS = ''+object.getDate();
        hourS = ''+object.getHours();
        minuteS = ''+object.getMinutes();
        secondS = ''+object.getSeconds();
      }
    }
    else if (typeof object == "string") {
        // string
        var dateReg = new RegExp("([0-9][0-9][0-9][0-9])-([0-9]\\d)-([0-9]\\d)+", "g");
        var dateParts = object.split(dateReg);
        yearS = dateParts[1] || '0';
        monthS = dateParts[2] || '0';
        dayS = dateParts[3] || '0';

        var timeReg = new RegExp("([01]\\d|2[0-9]):([0-5]\\d):([0-5]\\d)");
        var timeParts = object.match(timeReg);
        if (timeParts != null) {
            hourS = timeParts[1] || '00';
            minuteS = timeParts[2] || '00';
            secondS = timeParts[3] || '00';
        } else {
            hourS = '00';
            minuteS = '00';
            secondS = '00';
        }
    }
    // 4-2-2 2:2  
    while (yearS.length < 4) yearS = '0' + yearS;
    while (monthS.length < 2) monthS = '0' + monthS;
    while (dayS.length < 2) dayS = '0' + dayS;
    while (hourS.length < 2) hourS = '0' + hourS;
    while (minuteS.length < 2) minuteS = '0' + minuteS;
    while (secondS.length < 2) secondS = '0' + secondS;

    var newDate = yearS + '-' + monthS + '-' + dayS + ' ' + hourS + ':' + minuteS + ':'+secondS;
    return newDate;
}


function miappDateExtractDate(dateString) {

    var dateReg = new RegExp("([0-9][0-9][0-9][0-9])-([0-9]\\d)-([0-9]\\d)+", "g");
    var dateParts = dateString.split(dateReg);
    var yearS = dateParts[1] || '0';
    var monthS = dateParts[2] || '0';
    var dayS = dateParts[3] || '0';
    while (yearS.length < 4) yearS = '0' + yearS;
    while (monthS.length < 2) monthS = '0' + monthS;
    while (dayS.length < 2) dayS = '0' + dayS;
    return ''+ yearS + '-' + monthS + '-' + dayS;
}

function miappDateExtractTime(dateString) {
    var timeReg = new RegExp("([01]\\d|2[0-9]):([0-5]\\d):([0-5]\\d)");
    var timeParts = dateString.match(timeReg);
    var hourS = "00";
    var minuteS = "00";
    var secondS = "00";
    if (timeParts != null) {
        hourS = timeParts[1] || '00';
        minuteS = timeParts[2] || '00';
        secondS = timeParts[3] || '00';
    } else {
        hourS = '00';
        minuteS = '00';
        secondS = '00';
    }
    while (hourS.length < 2) hourS = '0' + hourS;
    while (minuteS.length < 2) minuteS = '0' + minuteS;
    while (secondS.length < 2) secondS = '0' + secondS;

    return '' + hourS + ':' + minuteS + ':'+secondS;
}


function miappPadNumber(num, digits, trim) {
    var neg = '';
    if (num < 0) {
        neg = '-';
        num = -num;
    }
    num = '' + num;
    while (num.length < digits) {
        num = '0' + num;
    }
    if (trim && (num.length > digits)) {
        num = num.substr(num.length - digits);
    }
    return neg + num;
}

miapp.formatError = function(arg) {
    if (arg instanceof Error) {
        if (arg.stack) {
            arg = (arg.message && arg.stack.indexOf(arg.message) === -1)
                ? 'Error: ' + arg.message + '\n' + arg.stack
                : arg.stack;
        } else if (arg.sourceURL) {
            arg = arg.message + '\n' + arg.sourceURL + ':' + arg.line;
        }
    }
    return arg;
};

miapp.Log = (function () {

    function Log(nbMax) {
        this.nbMax = nbMax || 1000;
        if (this.nbMax < 1) this.nbMax = 1;
        this.logEntries = [];
        this.callbackHandle = 0;
        this.callbacks = [];
    }

    Log.prototype.getLog = function () {
        return this.logEntries;
    };

    Log.prototype.clearLog = function () {
        this.logEntries = [];
    };

    Log.prototype.setNbMax = function (nbMax) {
        this.nbMax = nbMax || 1000;
        if (this.nbMax < 1) this.nbMax = 1;
        if (this.logEntries.length > this.nbMax) {
            this.logEntries.splice(0, (this.logEntries.length - this.nbMax));
        }
    };

    Log.prototype.log = function (msg, details, traceStackOffset) {
    	
    	//REMOVE_IN_PROD return {'date':'','msg':msg,'details':details};
    	    	
        details = details || '';
        var now = new Date();
        now = miappDateFormat(now) + '.' + now.getMilliseconds();
        // TODO : get the file and line of caller
        //var nb = (new Error).lineNumber;
        var from = '';
       	var stack;
        /*
        try {
            throw Error('');
        } catch(e) {
            stack = e.stack;
        }
        */
        traceStackOffset = traceStackOffset || 0;
        stack = (new Error).stack;
       	if (stack) {
            var caller_stack = stack.split("\n");
            var caller_line = caller_stack[2+traceStackOffset];
       		if (caller_line) {
       			var index = caller_line.indexOf("at ") + 3;
                from = ' at ' + caller_line.substr(index);
       		}
       	}
        if (details) {
            //MLE //TODO prod ? var ? console.log(now + from + ' : ' + msg + " : " + details);
        } else {
            //MLE console.log(now + from + ' : ' + msg);
        }
        var logEntry = {
            'date':now,
            'msg':msg,
            'details':details
        };
        if (this.logEntries.length >= this.nbMax) {
            this.logEntries.splice(0, 1);
        }
        this.logEntries.push(logEntry);

        for (var idx = 0, nb = this.callbacks.length; idx < nb; idx++) {
            try {
                this.callbacks[idx].callback(this.callbacks[idx].id, logEntry);
            } catch (e) {
                console.log("Error on callback#" + idx
                    + " called from Log for the logEntry " + miappDumpData(logEntry, 1)
                    + " : " + miapp.formatError(e));
            }
        }
        return logEntry;
    };

    Log.prototype.addListener = function (fct) {
        this.callbackHandle++;
        this.callbacks.push({id:this.callbackHandle, callback:fct});
        return this.callbackHandle;
    };

    Log.prototype.cancelListener = function (callbackHandle) {
        for (var idx = this.callbacks.length - 1; idx >= 0; idx--) {
            if (this.callbacks[idx].id == callbackHandle) {
                this.callbacks.splice(idx, 1);
                return true;
            }
        }
        return false;
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Log;
})(); // Invoke the function immediately to create this class.

miapp.ErrorLog = new miapp.Log(1000);
miapp.InternalLog = new miapp.Log(1000);

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Move drawer.
 */
a4p.MoveDrawer = (function () {
    function MoveDrawer(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.begin = function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        };
        this.add = function (p0) {
            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.arc(p0.x, p0.y, 2, 0, 2 * Math.PI);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.arc(p0.x + p0.dx, p0.y + p0.dy, 2, 0, 2 * Math.PI);
            this.ctx.stroke();

            //ctx0.fillStyle = 'red';
            this.ctx.strokeStyle = 'green';
            this.ctx.lineWidth = "1";
            this.ctx.beginPath();
            this.ctx.moveTo(p0.x, p0.y);
            this.ctx.lineTo(p0.x + p0.dx, p0.y + p0.dy);
            this.ctx.stroke();
        };
        this.end = function () {
        };
    }

    return MoveDrawer;
})();

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Move interpolator.
 */
a4p.MoveInterpolator = (function () {
    function MoveInterpolator(scale) {
        var samplePoint0, samplePoint1, sample10X, sample10Y, sampleDist10, sampleAngle10;

        this.listeners = [];
        /**
         * Interpolation result of points entered via add() method
         * @type {Array}
         */
        this.moves = [];

        this.begin = function () {
            this.moves = [];
            samplePoint0 = null;
            samplePoint1 = null;
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].begin();
            }
        };

        this.add = function (x, y, timeStamp) {
            if (samplePoint0 == null) {
                samplePoint0 = {x: x, y: y, timeStamp: timeStamp};
                return;
            }
            if (samplePoint1 == null) {
                if ((x == samplePoint0.x) && (y == samplePoint0.y)) return;

                samplePoint1 = {x: x, y: y, timeStamp: timeStamp};
                sample10X = samplePoint1.x - samplePoint0.x;
                sample10Y = samplePoint1.y - samplePoint0.y;
                sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y);
                sampleAngle10 = Math.atan2(sample10Y, sample10X); // in ]-PI, +PI]

                var compass1 = orientation(sampleAngle10);
                this.moves.push({
                    x: samplePoint0.x,
                    y: samplePoint0.y,
                    dx: sample10X,
                    dy: sample10Y,
                    d: sampleDist10,
                    angle: sampleAngle10,
                    compass: compass1,
                    timeStamp: samplePoint0.timeStamp
                });
                for (var idx1 = 0; idx1 < this.listeners.length; idx1++) {
                    this.listeners[idx1].add({
                        x: samplePoint0.x,
                        y: samplePoint0.y,
                        dx: sample10X,
                        dy: sample10Y,
                        d: sampleDist10,
                        angle: sampleAngle10,
                        compass: compass1,
                        timeStamp: samplePoint0.timeStamp
                    });
                }
                return;
            }
            if ((x == samplePoint1.x) && (y == samplePoint1.y)) return;

            var oldDist = sampleDist10;

            var tangentX = x - samplePoint0.x;
            var tangentY = y - samplePoint0.y;
            var tangentDist = Math.sqrt(tangentX * tangentX + tangentY * tangentY);
            var tangentAngle = Math.atan2(tangentY, tangentX); // in ]-PI, +PI]

            sample10X = x - samplePoint1.x;
            sample10Y = y - samplePoint1.y;
            sampleDist10 = Math.sqrt(sample10X * sample10X + sample10Y * sample10Y);
            sampleAngle10 = Math.atan2(sample10Y, sample10X); // in ]-PI, +PI]

            var compass2 = orientation(tangentAngle);
            this.moves.push({
                x: samplePoint1.x,
                y: samplePoint1.y,
                dx: tangentX * (oldDist + sampleDist10) / 2 / tangentDist,
                dy: tangentY * (oldDist + sampleDist10) / 2 / tangentDist,
                d: (oldDist + sampleDist10) / 2,
                angle: tangentAngle,
                compass: compass2,
                timeStamp: samplePoint1.timeStamp
            });
            for (var idx2 = 0; idx2 < this.listeners.length; idx2++) {
                this.listeners[idx2].add({
                    x: samplePoint1.x,
                    y: samplePoint1.y,
                    dx: tangentX * (oldDist + sampleDist10) / 2 / tangentDist,
                    dy: tangentY * (oldDist + sampleDist10) / 2 / tangentDist,
                    d: (oldDist + sampleDist10) / 2,
                    angle: tangentAngle,
                    compass: compass2,
                    timeStamp: samplePoint1.timeStamp
                });
            }

            samplePoint0 = samplePoint1;
            samplePoint1 = {x: x, y: y, timeStamp: timeStamp};
        };

        this.end = function () {
            if (samplePoint1 != null) {
                var compass1 = orientation(sampleAngle10);
                this.moves.push({
                    x: samplePoint1.x,
                    y: samplePoint1.y,
                    dx: sample10X,
                    dy: sample10Y,
                    d: sampleDist10,
                    angle: sampleAngle10,
                    compass: compass1,
                    timeStamp: samplePoint1.timeStamp
                });
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i].add({
                        x: samplePoint1.x,
                        y: samplePoint1.y,
                        dx: sample10X,
                        dy: sample10Y,
                        d: sampleDist10,
                        angle: sampleAngle10,
                        compass: compass1,
                        timeStamp: samplePoint1.timeStamp
                    });
                }
            }
            for (var idx1 = 0; idx1 < this.listeners.length; idx1++) {
                this.listeners[idx1].end();
            }
        };
    }

    MoveInterpolator.prototype.size = function () {
        return this.moves.length;
    };

    /**
     * Adding a listener to draw or use the movements interpolated by MoveInterpolator.
     * Each listener must implement begin() function : called at start of each sample.
     * Each listener must implement add(event) function : called for each significant position.
     * Each event has following attributes : x, y, dx, dy, d, angle, compass, timeStamp.
     * Each listener must implement end() function : called at end of each sample.
     *
     * @param {object} listener Drawer
     */
    MoveInterpolator.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };

    var step = Math.PI / 8;

    function orientation(angle) { // angle in ]-PI, +PI]
        if (angle > (Math.PI - step)) {
            return 'W';
        } else if (angle > (Math.PI - 3 * step)) {
            return 'SW';
        } else if (angle > (Math.PI - 5 * step)) {
            return 'S';
        } else if (angle > (Math.PI - 7 * step)) {
            return 'SE';
        } else if (angle > (Math.PI - 9 * step)) {
            return 'E';
        } else if (angle > (Math.PI - 11 * step)) {
            return 'NE';
        } else if (angle > (Math.PI - 13 * step)) {
            return 'N';
        } else if (angle > (Math.PI - 15 * step)) {
            return 'NW';
        } else {
            return 'W';
        }
    }

    return MoveInterpolator;
})();

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Returns a function, that, when invoked, will only be triggered at most once during a given window of time.
 *
 * Example of use :
 * <code>
 * var socket = io.connect();
 * socket.on(eventName, a4p.throttle(function () { // limit to once every 500ms
 *   var args = arguments;
 *   a4p.safeApply($scope, function() {
 *       callback.apply(socket, args);
 *   });
 * }, 500));
 * </code>
 *
 * @param func Callback to execute
 * @param wait Time in ms between 2 successive execution of Callback
 * @return {Function} Function which will return undefined if wait time is not expired, or the result of func call if wait time is expired.
 * @see https://github.com/documentcloud/underscore/blob/master/underscore.js#L626
 */
a4p.throttle = function (func, wait) {
    var context, args, timeout, result;
    var previous = 0;
    var later = function () {
        previous = new Date();
        timeout = null;
        result = func.apply(context, args);
    };
    return function () {
        var now = new Date();
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
            window.clearTimeout(timeout);
            timeout = null;
            previous = now;
            result = func.apply(context, args);
        } else if (!timeout) {
            timeout = window.setTimeout(later, remaining);
        }
        return result;
    };
};

/**
 * Returns a function, that, when invoked, will only be triggered at least <wait> time of delay
 * after the last call. Each call before this timeout will delay it at least <wait> time. Then
 * callback function will not be called while returned function is called within <wait> time since
 * last call.
 *
 * Example of use :
 * <code>
 * var fct = a4p.delay(function () {...}, 500));
 * window.setTimeout(fct, 100);// {...} will be executed in 500ms
 * window.setTimeout(fct, 100);// {...} will be executed only in 500ms
 * window.setTimeout(fct, 100);// {...} will be executed only in 500ms
 * // {...} will be executed in 500ms
 * </code>
 *
 * @param func Callback to execute
 * @param wait Time in ms to wait after each call before executing Callback
 * @return {Function} Function which will return running timer.
 */
a4p.delay = function (func, wait) {
    var context, args, timeout;
    var previous = 0;
    var later = function () {
        var now = (new Date()).getTime();
        var remaining = wait - (now - previous);
        if (remaining > 0) {
            timeout = window.setTimeout(later, remaining);
        } else {
            timeout = null;
            func.apply(context, args);
        }
    };
    return function () {
        previous = (new Date()).getTime();
        if (!timeout) {
            context = this;
            args = arguments;
            timeout = window.setTimeout(later, wait);
        }
        return timeout;
    };
};
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Sampler of finger successive coords to extract only a subset of significant positions.
 * Then it is possible to interpolate this subset with a bezier curve for example.
 */
a4p.PointSampler = (function () {
    /**
     * Sampler of finger successive coords to extract only a subset of significant positions.
     * Then it is possible to interpolate this subset with a bezier curve interpolator for example.
     * @param {int} maxIdleTime Maximum delay (in ms) for no move (defaults to 10 ms)
     * @param {int} minDistance Minimum distance (in pixel) between p1 and p2 (defaults to nearly 3 pixels)
     * @constructor
     */
    function PointSampler(maxIdleTime, minDistance) {
        var addSampleTimeout = null;
        var sourcePoint0;
        var sourcePoint1;
        var ptTimeout;
        var lg0;
        var lg1;

        this.listeners = [];
        /**
         * Maximum delay in ms for no move
         * @type {Number}
         */
        this.maxIdleTime = maxIdleTime || 10;
        /**
         * Minimal distance*distance between p1 and p2
         * @type {Number}
         */
        this.minSqrDistance = minDistance * minDistance || 10;
        /**
         * Stats about which criteria validated a sample point
         * @type {Object}
         */
        this.stats = {timeout: 0, angle: 0, lg: 0};
        /**
         * Sample : sampling result of points entered via addSample() method
         * @type {Array}
         */
        this.points = [];

        this.beginSample = function () {
            sourcePoint0 = null;
            sourcePoint1 = null;
            ptTimeout = null;
            lg0 = 0;
            lg1 = 0;
            if (addSampleTimeout != null) clearTimeout(addSampleTimeout);
            addSampleTimeout = null;
            this.stats = {timeout: 0, angle: 0, lg: 0};
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].begin();
            }
        };

        this.addSample = function (x, y, timeStamp) {// next
            var self = this;
            // Wait for 2 first points
            if (sourcePoint0 == null) {
                if (addSampleTimeout != null) clearTimeout(addSampleTimeout);
                addSampleTimeout = null;
                ptTimeout = null;

                this.points.push({x: x, y: y});
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i].add(x, y, timeStamp);
                }
                sourcePoint0 = {x: x, y: y};
                return;
            }
            if (sourcePoint1 == null) {
                // Ignore successive identical points
                lg0 = (x - sourcePoint0.x) * (x - sourcePoint0.x)
                    + (y - sourcePoint0.y) * (y - sourcePoint0.y);
                if (lg0 > this.minSqrDistance) {
                    if (addSampleTimeout != null) clearTimeout(addSampleTimeout);
                    addSampleTimeout = null;
                    ptTimeout = null;

                    this.stats.lg++;
                    this.points.push({x: x, y: y});
                    for (var i = 0; i < this.listeners.length; i++) {
                        this.listeners[i].add(x, y, timeStamp);
                    }
                    sourcePoint1 = {x: x, y: y};
                } else {
                    ptTimeout = {x: x, y: y, timeStamp: timeStamp};
                    if (addSampleTimeout == null) {
                        addSampleTimeout = setTimeout(function () {
                            self.stats.timeout++;
                            self.points.push({x: ptTimeout.x, y: ptTimeout.y});
                            for (var i = 0; i < self.listeners.length; i++) {
                                self.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp);
                            }
                            sourcePoint1 = {x: ptTimeout.x, y: ptTimeout.y};
                            ptTimeout = null;
                            addSampleTimeout = null;
                        }, this.maxIdleTime);
                    }
                }
                return;
            }

            // Ignore successive identical points
            lg1 = (x - sourcePoint1.x) * (x - sourcePoint1.x)
                + (y - sourcePoint1.y) * (y - sourcePoint1.y);
            var lg2 = (x - sourcePoint0.x) * (x - sourcePoint0.x)
                + (y - sourcePoint0.y) * (y - sourcePoint0.y);
            if (lg1 > this.minSqrDistance) {
                //Math.sqrt(lg0) + Math.sqrt(lg1) == Math.sqrt(lg2)
                if ((lg1 + lg0) > 1.5 * lg2) {
                    // Turn angle > 90�
                    if (addSampleTimeout != null) clearTimeout(addSampleTimeout);
                    addSampleTimeout = null;
                    ptTimeout = null;

                    this.stats.lg++;
                    this.points.push({x: x, y: y});
                    for (var i = 0; i < this.listeners.length; i++) {
                        this.listeners[i].add(x, y, timeStamp);
                    }
                    sourcePoint0 = sourcePoint1;
                    sourcePoint1 = {x: x, y: y};
                    lg0 = lg1;
                } else {
                    if ((lg1 + lg0 - lg2) > 36) {
                        // More than 6 pixels diff in turn change
                        if (addSampleTimeout != null) clearTimeout(addSampleTimeout);
                        addSampleTimeout = null;
                        ptTimeout = null;

                        this.stats.angle++;
                        this.points.push({x: x, y: y});
                        for (var i = 0; i < this.listeners.length; i++) {
                            this.listeners[i].add(x, y, timeStamp);
                        }
                        sourcePoint0 = sourcePoint1;
                        sourcePoint1 = {x: x, y: y};
                        lg0 = lg1;
                    } else {
                        ptTimeout = {x: x, y: y, timeStamp: timeStamp};
                        if (addSampleTimeout == null) {
                            addSampleTimeout = setTimeout(function () {
                                self.stats.timeout++;
                                self.points.push({x: ptTimeout.x, y: ptTimeout.y});
                                for (var i = 0; i < self.listeners.length; i++) {
                                    self.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp);
                                }
                                sourcePoint0 = sourcePoint1;
                                sourcePoint1 = {x: ptTimeout.x, y: ptTimeout.y};
                                ptTimeout = null;
                                addSampleTimeout = null;
                                lg0 = lg1;
                            }, this.maxIdleTime);
                        }
                    }
                }
            } else {
                ptTimeout = {x: x, y: y, timeStamp: timeStamp};
                if (addSampleTimeout == null) {
                    addSampleTimeout = setTimeout(function () {
                        self.stats.timeout++;
                        self.points.push({x: ptTimeout.x, y: ptTimeout.y});
                        for (var i = 0; i < self.listeners.length; i++) {
                            self.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp);
                        }
                        sourcePoint0 = sourcePoint1;
                        sourcePoint1 = {x: ptTimeout.x, y: ptTimeout.y};
                        ptTimeout = null;
                        addSampleTimeout = null;
                        lg0 = lg1;
                    }, this.maxIdleTime);
                }
            }
        };

        this.endSample = function () {
            if (addSampleTimeout != null) clearTimeout(addSampleTimeout);
            addSampleTimeout = null;
            if (ptTimeout != null) {
                this.points.push({x: ptTimeout.x, y: ptTimeout.y});
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i].add(ptTimeout.x, ptTimeout.y, ptTimeout.timeStamp);
                }
            }
            sourcePoint0 = null;
            sourcePoint1 = null;
            ptTimeout = null;
            lg0 = 0;
            lg1 = 0;
            for (var i = 0; i < this.listeners.length; i++) {
                this.listeners[i].end();
            }
        };

    }

    /**
     * Adding a listener to interpolate the subset of significant positions extracted by PointSampler.
     * Each listener must implement begin() function : called at start of each sample.
     * Each listener must implement add(x, y, timeStamp) function : called for each significant position.
     * Each listener must implement end() function : called at end of each sample.
     *
     * @param object listener Interpolator
     */
    PointSampler.prototype.addListener = function (listener) {
        this.listeners.push(listener);
    };

    return PointSampler;
})();

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Management of resize listeners
 */
a4p.Resize = (function (navigator, window, document) {

    //var nameExpr = "[a-zA-Z_][a-zA-Z0-9_-]*";
    //var nodeExpr = "(parentNode|previousElementSibling|nextElementSibling|firstElementChild|lastElementChild)";
    //var attrExpr = "(clientTop|clientLeft|clientWidth|clientHeight|offsetTop|offsetLeft|offsetWidth|offsetHeight)";
    //var subPathExpr = "(\\."+nodeExpr+")*";
    //var atPathExpr=new RegExp("@(("+nodeExpr+subPathExpr+")\\.)?"+attrExpr, "g");
    //var atResizerExpr=new RegExp("@("+nameExpr+")("+subPathExpr+")\\."+attrExpr, "g");

    var orientationChangeHandlerStarted = false;
    var orientationChangeEvent = false;
    var endRefreshResizersTimer = null;
    var endRefreshResizersTimeout = 200;
    var endRefreshResizersCount = 0;
    var rootListener = [];
    var listenersIndex = {};
    var rootScope = null;
    var attrIndex = {};// Dictionary of css attributes to read (some will be calculated by readers)
    var refreshWriteQueue = [];// List of writes to do

    // TODO : do all needed reads, and then do all writes in one pass to reduce CPU of reflow
    // TODO : limit at 1 refresh per frame

    function refreshResizers() {
        attrIndex = {};
        refreshWriteQueue = [];// List of writes to do
        var key, fn, nodeDependent, value;

        // Set readers list => Trigger the "Forced synchronous layout"
        for (var idx = 0, nb = rootListener.length; idx < nb; idx++) {
            var resizer = rootListener[idx];

            // Set scoped variables
            for (var varIdx = 0, varNb = resizer.scopeVars.length; varIdx < varNb; varIdx++) {
                key = resizer.scopeVars[varIdx].key;
                fn = resizer.scopeVars[varIdx].fn;
                nodeDependent = resizer.scopeVars[varIdx].nodeDependent;
                //this.scope[key] = 0;
                value = fn(resizer.scope, {});
                setVar(resizer, key, value);
            }
            // Set css attributes
            for (var cssIdx = 0, cssNb = resizer.cssKeys.length; cssIdx < cssNb; cssIdx++) {
                key = resizer.cssKeys[cssIdx].key;
                fn = resizer.cssKeys[cssIdx].fn;
                nodeDependent = resizer.cssKeys[cssIdx].nodeDependent;
                value = fn(resizer.scope, {});
                switch (key) {
                    case 'top':
                        //console.log('@'+resizer.name+'.clientTop = ' + value);
                        if (a4p.isDefined(listenersIndex[resizer.name]) && (listenersIndex[resizer.name].id == resizer.id)) {
                            attrIndex['@' + resizer.name + '.clientTop'] = value;
                            attrIndex['@' + resizer.name + '.offsetTop'] = value;
                        }
                        attrIndex['@' + resizer.id + '.clientTop'] = value;
                        attrIndex['@' + resizer.id + '.offsetTop'] = value;
                        break;
                    case 'left':
                        //console.log('@'+resizer.name+'.clientLeft = ' + value);
                        if (a4p.isDefined(listenersIndex[resizer.name]) && (listenersIndex[resizer.name].id == resizer.id)) {
                            attrIndex['@' + resizer.name + '.clientLeft'] = value;
                            attrIndex['@' + resizer.name + '.offsetLeft'] = value;
                        }
                        attrIndex['@' + resizer.id + '.clientLeft'] = value;
                        attrIndex['@' + resizer.id + '.offsetLeft'] = value;
                        break;
                    case 'width':
                        //console.log('@'+resizer.name+'.clientWidth = ' + value);
                        if (a4p.isDefined(listenersIndex[resizer.name]) && (listenersIndex[resizer.name].id == resizer.id)) {
                            attrIndex['@' + resizer.name + '.clientWidth'] = value;
                            attrIndex['@' + resizer.name + '.offsetWidth'] = value;
                        }
                        attrIndex['@' + resizer.id + '.clientWidth'] = value;
                        attrIndex['@' + resizer.id + '.offsetWidth'] = value;
                        break;
                    case 'height':
                        //console.log('@'+resizer.name+'.clientHeight = ' + value);
                        if (a4p.isDefined(listenersIndex[resizer.name]) && (listenersIndex[resizer.name].id == resizer.id)) {
                            attrIndex['@' + resizer.name + '.clientHeight'] = value;
                            attrIndex['@' + resizer.name + '.offsetHeight'] = value;
                        }
                        attrIndex['@' + resizer.id + '.clientHeight'] = value;
                        attrIndex['@' + resizer.id + '.offsetHeight'] = value;
                        break;
                    case 'minHeight':
                        break;
                    case 'minWidth':
                        break;
                    case 'lineHeight':
                        break;
                }

                //console.log('refreshWriteQueue + :'+resizer.name+' '+key+' '+value);
                refreshWriteQueue.push({
                    resizer: resizer,
                    cssAttr: key,
                    value: value,
                    nodeDependent: nodeDependent
                });
            }
        }

        // Exec writers list
        for (var jobIdx = 0, jobNb = refreshWriteQueue.length; jobIdx < jobNb; jobIdx++) {
            var job = refreshWriteQueue[jobIdx];
            setCss(job.resizer, job.cssAttr, '' + job.value + 'px');
        }

        if (rootScope) a4p.safeApply(rootScope);
    }

    function endRefreshResizers() {
        if (endRefreshResizersCount) {
            //console.log("Redo endRefreshResizers");
        }

        var previousAttrIndex = attrIndex;
        var previousRefreshWrites = {};
        for (var i = 0, nb = refreshWriteQueue.length; i < nb; i++) {
            var job = refreshWriteQueue[i];
            previousRefreshWrites[job.resizer.id + '-' + job.cssAttr] = job.value;
        }

        refreshResizers();

        var dirty = false;
        for (var optKey in attrIndex) {
            if (!attrIndex.hasOwnProperty(optKey)) continue;
            if (previousAttrIndex[optKey] != attrIndex[optKey]) {
                dirty = true;
                a4p.ErrorLog.log('a4p.Resize', 'COLLATERAL ' + endRefreshResizersCount + ' effect of resizers upon ' + optKey
                    + ' : ' + previousAttrIndex[optKey] + ',' + attrIndex[optKey]
                    + ' : try to move some resize-css-* option in its DOM children.');
            }
        }
        for (var jobIdx = 0, jobNb = refreshWriteQueue.length; jobIdx < jobNb; jobIdx++) {
            var job = refreshWriteQueue[jobIdx];
            if (a4p.isUndefined(previousRefreshWrites[job.resizer.id + '-' + job.cssAttr])) {
                dirty = true;
                a4p.ErrorLog.log('a4p.Resize', 'COLLATERAL ' + endRefreshResizersCount + ' effect of resizers upon ' + job.resizer.name + '.' + job.cssAttr + ' which did not exist previously.');
            } else if (previousRefreshWrites[job.resizer.id + '-' + job.cssAttr] != job.value) {
                dirty = true;
                a4p.ErrorLog.log('a4p.Resize', 'COLLATERAL ' + endRefreshResizersCount + ' effect of resizers upon ' + job.resizer.name + '.' + job.cssAttr + ' which had another value previously.');
            }
        }

        if (dirty && !endRefreshResizersCount) {
            endRefreshResizersCount++;
            endRefreshResizersTimer = miapp.BrowserCapabilities.nextFrame(endRefreshResizers);
        } else {
            // AFTER having updated resizers, we now can broadcast EVT_WINDOW to Sense and Scroll objects
            // BEWARE : we MUST update resizers BEFORE transmitting event to Sense which will refresh SCROLLERS, or else maxScrollX==WrapperW-ScrollerW are false
            if (orientationChangeEvent) {
                /*
                 Resize.clearWindowAll();
                 windowAllTimeout();
                 */
                Resize.windowAll();
            }
        }
    }

    function refreshAllTimeout() {
        /*
         a4p.InternalLog.log('a4p.Resize', 'refreshAllTimeout : resizeOrientation=' + Resize.resizeOrientation
         + ' resizePortrait=' + Resize.resizePortrait + ' resizeOneColumn=' + Resize.resizeOneColumn
         + ' resizeWidth=' + Resize.resizeWidth + ' resizeHeight=' + Resize.resizeHeight);
         */
        // Method 1 : ONE call only
        /*
         endRefreshResizers();
         */

        // Method 2 : TWO calls via nextFrame
        if (endRefreshResizersTimer) {
            miapp.BrowserCapabilities.cancelFrame(endRefreshResizersTimer);
            endRefreshResizersTimer = null;
        }

        refreshResizers();

        // Because writers can change again readers,
        // we should call again refreshResizers() if something has changed.
        // But we do it only once more after Browser had recalculated its layout.
        endRefreshResizersCount = 0;
        endRefreshResizersTimer = miapp.BrowserCapabilities.nextFrame(endRefreshResizers);

        // Method 3 : TWO calls via setTimeout
        /*
         if (endRefreshResizersTimer) {
         window.clearTimeout(endRefreshResizersTimer);
         endRefreshResizersTimer = null;
         }

         refreshResizers();

         // Because writers can change again readers,
         // we should call again refreshResizers() if something has changed.
         // But we do it only once more after Browser had recalculated its layout.
         endRefreshResizersTimer = window.setTimeout(endRefreshResizers, endRefreshResizersTimeout);
         */
    }

    function windowAllTimeout() {
        orientationChangeEvent = false;

        for (var idx = 0, nb = rootListener.length; idx < nb; idx++) {
            var resizer = rootListener[idx];
            resizer.triggerEvent(EVT_WINDOW, {
                id: resizer.id,
                name: resizer.name,
                resizeOrientation: Resize.resizeOrientation,
                resizePortrait: Resize.resizePortrait,
                resizeOneColumn: Resize.resizeOneColumn,
                resizeWidth: Resize.resizeWidth,
                resizeHeight: Resize.resizeHeight
            });
        }
    }

    function orderResizeListeners() {
        // reorder listeners (do only 1 pass even if dependency loops exist)
        var trace;
        /*
         var trace = rootListener.length + ' resizeListeners';
         for (var i = 0, nb = rootListener.length; i < nb; i++) {
         trace += '\n  [' + i + '] ' + rootListener[i].name;
         }
         a4p.InternalLog.log('a4p.Resize', 'before reorder : ' + trace);
         */
        Resize.isReordering = true;
        for (var idx = rootListener.length - 1; idx >= 0; idx--) {
            var depNodes = rootListener[idx].dependingOnNodes();
            /*
             trace = rootListener[idx].name + ' depends on following nodes :';
             for (var i = 0, nb = depNodes.length; i < nb; i++) {
             trace += ' ' + depNodes[i];
             }
             a4p.InternalLog.log('a4p.Resize', trace);
             */
            moveResizeListenerAfterDependentNodes(rootListener[idx], depNodes);
        }
        Resize.isReordering = false;
        /*
         trace = rootListener.length + ' resizeListeners';
         for (var i = 0, nb = rootListener.length; i < nb; i++) {
         trace += '\n  [' + i + '] ' + rootListener[i].name;
         }
         a4p.InternalLog.log('a4p.Resize', 'after reorder : ' + trace);
         */
    }

    /**
     * Add a listener at highest priority level (do not depend on others)
     *
     * @param resizeListener
     */
    function addResizeListener(resizeListener) {
        if (a4p.isUndefinedOrNull(listenersIndex[resizeListener.id])) {
            listenersIndex[resizeListener.id] = resizeListener;
            rootListener.push(resizeListener);
            // Not perfect alternative key because duplicate key is possible and then old resize is hidden
            listenersIndex[resizeListener.name] = resizeListener;
            orderResizeListeners();
        }
    }

    /**
     * Remove a listener
     *
     * @param resizeListener
     */
    function removeResizeListener(resizeListener) {
        removeIdFromList(rootListener, resizeListener.id);
        if (a4p.isDefined(listenersIndex[resizeListener.id])) {
            delete listenersIndex[resizeListener.id];
        }
        if (a4p.isDefined(listenersIndex[resizeListener.name]) && (listenersIndex[resizeListener.name].id == resizeListener.id)) {
            delete listenersIndex[resizeListener.name];
        }
    }

    function moveResizeListenerAfterDependentNodes(resizeListener, dependentNodeNames) {
        var selfIdx, nb = rootListener.length, depNb = dependentNodeNames.length;
        for (selfIdx = 0; selfIdx < nb; selfIdx++) {
            if (rootListener[selfIdx].id == resizeListener.id) break;
        }
        var lastDepIdx = selfIdx;
        for (var otherIdx = selfIdx + 1; otherIdx < nb; otherIdx++) {
            var otherListenerId = rootListener[otherIdx].id;
            for (var depIdx = 0; depIdx < depNb; depIdx++) {
                var depName = dependentNodeNames[depIdx];
                if (otherListenerId == listenersIndex[depName].id) {
                    lastDepIdx = otherIdx;
                    break;
                }
            }
        }
        if (lastDepIdx > selfIdx) {
            rootListener.splice(selfIdx, 1);
            rootListener.splice(lastDepIdx, 0, resizeListener);
            /*
             var trace = rootListener.length + ' resizeListeners';
             for (var i = 0, nb = rootListener.length; i < nb; i++) {
             trace += '\n  [' + i + '] ' + rootListener[i].name;
             }
             a4p.InternalLog.log('a4p.Resize', 'reorder : ' + trace);
             */
        }
    }

    function setVar(self, name, newValue) {
        //a4p.InternalLog.log('a4p.Resize ' + self.name, 'setVar ' + name + '=' + newValue);
        self.scope[name] = newValue;
    }

    function setCss(self, name, newValue) {
        //a4p.InternalLog.log('a4p.Resize ' + self.name, 'setCss ' + name + '=' + newValue);
        var oldValue = self.DOMelement.style[name];
        //self.DOMelement.style[name] = newValue;
        self.element.css(name, newValue);
        if (newValue !== oldValue) {
            //a4p.InternalLog.log('a4p.Resize ' + self.name, 'set its css attribute ' + name + ' to ' + newValue);
            window.setTimeout(function () {
                self.triggerEvent(EVT_CHANGED, {
                    id: self.id,
                    name: self.name,
                    attr: name,
                    value: newValue
                });
            }, miapp.BrowserCapabilities.isAndroid ? 200 : 0);
        }
    }

    // A consistent way to create a unique ID which will never overflow.

    var uid = ['0', '0', '0'];
    var idStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var idNext = {
        '0': 1, '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7, '7': 8, '8': 9, '9': 10,
        'A': 11, 'B': 12, 'C': 13, 'D': 14, 'E': 15, 'F': 16, 'G': 17, 'H': 18, 'I': 19, 'J': 20,
        'K': 21, 'L': 22, 'M': 23, 'N': 24, 'O': 25, 'P': 26, 'Q': 27, 'R': 28, 'S': 29, 'T': 30,
        'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 0
    };

    function nextUid() {
        var index = uid.length;
        while (index) {
            index--;
            var i = idNext[uid[index]];
            uid[index] = idStr[i];
            if (i > 0) {
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    }

    // Basic events transmitted to user

    var EVT_BEFORE_WINDOW = 'BeforeWindow';// When viewport has changed (orientation, size) but BEFORE updating Resizers
    var EVT_WINDOW = 'Window';// When viewport has changed (orientation, size)
    var EVT_CHANGED = 'Changed';

    // Gesture utilities

    /*
     function documentXToViewportX(x) {
     return x - window.pageXOffset;
     }

     function documentYToViewportY(y) {
     return y - window.pageYOffset;
     }

     function viewportXToDocumentX(x) {
     return x + window.pageXOffset;
     }

     function viewportYToDocumentY(y) {
     return y + window.pageYOffset;
     }

     function elementFromPointIsUsingViewPortCoordinates() {
     if (window.pageYOffset > 0) {     // page scrolled down
     return (window.document.elementFromPoint(0, window.pageYOffset + window.innerHeight - 1) == null);
     } else if (window.pageXOffset > 0) {   // page scrolled to the right
     return (window.document.elementFromPoint(window.pageXOffset + window.innerWidth - 1, 0) == null);
     }
     return false; // no scrolling, don't care
     }

     var usingViewPortCoordinates = elementFromPointIsUsingViewPortCoordinates();

     function elementFromDocumentPoint(x, y) {
     if (usingViewPortCoordinates) {
     return window.document.elementFromPoint(documentXToViewportX(x), documentYToViewportY(y));
     } else {
     return window.document.elementFromPoint(x, y);
     }
     }

     function elementFromViewportPoint(x, y) {
     if (usingViewPortCoordinates) {
     return window.document.elementFromPoint(x, y);
     } else {
     return window.document.elementFromPoint(viewportXToDocumentX(x), viewportYToDocumentY(y));
     }
     }
     */

    function Resize($rootScope, scope, element, options) {
        rootScope = $rootScope;
        // State
        this.id = nextUid();
        this.name = this.id;
        this.scope = scope;
        this.timeStamp = 0;
        // JQLite element
        this.element = element;
        // DOM element
        /**
         * HTMLElement associated with this Resize listener
         * @type {HTMLElement}
         */
        this.DOMelement = null;
        if (typeof(element) == 'object') {
            this.DOMelement = element[0];
        } else {
            this.DOMelement = document.getElementById(element);
        }

        // Default options
        this.options = {
            callApply: false // use $apply on every event/gesture resize directive
        };

        // User defined options
        this.nodeList = [];
        this.nodeIndex = {};
        this.cssKeys = [];
        this.scopeVars = [];
        for (var optKey in options) {
            if (!options.hasOwnProperty(optKey)) continue;
            this.options[optKey] = options[optKey];
            if (optKey == 'name') {
                this.name = options[optKey];
            }
        }

        var self = this;

        // Add this listener
        addResizeListener(this);

        // BUG : element not destroyed (element $destroy not fired, but scope $destroy is fired)
        this.element.bind('$destroy', function () {
            self.destroy();
        });

        if (!orientationChangeHandlerStarted) {
            //a4p.InternalLog.log('a4p.Resize', 'window.addEventListener('+miapp.BrowserCapabilities.RESIZE_EVENT+', Resize.handleDocOrientationChange)');
            window.addEventListener(miapp.BrowserCapabilities.RESIZE_EVENT, Resize.handleDocOrientationChange, false);
            orientationChangeHandlerStarted = true;
            window.setTimeout(function () {
                a4p.safeApply($rootScope, function () {
                    Resize.handleDocOrientationChange();
                });
            }, 200);
        }
    }

    Resize.prototype.destroy = function () {
        // Unregister
        removeResizeListener(this);

        //a4p.InternalLog.log('a4p.Resize ' + this.name, 'delete Resize');
        return true;
    };

    // Static variables to be accessible from any Angular Controller

    Resize.initWidth = 0;
    Resize.initHeight = 0;
    Resize.initOrientation = 0;
    Resize.initPortrait = false;
    Resize.initPortrait0Orientation = false;

    Resize.resizeOrientation = "landscape";
    Resize.resizePortrait = false;
    Resize.resizeOneColumn = false;
    Resize.resizeWidth = 0; //240 ?
    Resize.resizeHeight = 0; //240 ?

    Resize.isReordering = false;

    // Triggering User events via angular directives

    Resize.prototype.triggerEvent = function (name, evt) {
        var toSenseEventName = 'toSense' + name;
        if (a4p.isDefined(this[toSenseEventName]) && (this[toSenseEventName] != null)) {
            try {
                //a4p.InternalLog.log('a4p.Resize ' + this.name, 'triggerEvent toSense '+name);
                this[toSenseEventName](evt);
            } catch (exception) {
                // handler may be destroyed
            }
        }
        var onEventName = 'on' + name;
        if (a4p.isDefined(this[onEventName]) && (this[onEventName] != null)) {
            try {
                //a4p.InternalLog.log('a4p.Resize ' + this.name, 'triggerEvent '+name);
                this[onEventName](evt);
            } catch (exception) {
                // handler may be destroyed
            }
            return true;
        }
        return false;
    };

    /*
     // Solution to resolve parent/scroll offsets found at http://www.greywyvern.com/?post=331
     function findBoundingClientRect(obj) {
     var curleft = 0, curtop = 0, scr = obj, fixed = false;
     while ((scr = scr.parentNode) && scr != document.body) {
     curleft -= scr.scrollLeft || 0;
     curtop -= scr.scrollTop || 0;
     if (getStyle(scr, "position") == "fixed") fixed = true;
     }
     if (fixed && !window.opera) {
     var scrDist = scrollDist();
     curleft += scrDist[0];
     curtop += scrDist[1];
     }
     do {
     curleft += obj.offsetLeft;
     curtop += obj.offsetTop;
     } while (obj = obj.offsetParent);
     return {
     left: curleft,
     top: curtop
     };
     }

     function scrollDist() {
     var html = document.getElementsByTagName('html')[0];
     if (html.scrollTop && document.documentElement.scrollTop) {
     return [html.scrollLeft, html.scrollTop];
     } else if (html.scrollTop || document.documentElement.scrollTop) {
     return [
     html.scrollLeft + document.documentElement.scrollLeft,
     html.scrollTop + document.documentElement.scrollTop
     ];
     } else if (document.body.scrollTop)
     return [document.body.scrollLeft, document.body.scrollTop];
     return [0, 0];
     }

     function getStyle(obj, styleProp) {
     if (obj.currentStyle) {
     var y = obj.currentStyle[styleProp];
     } else if (window.getComputedStyle)
     var y = window.getComputedStyle(obj, null)[styleProp];
     return y;
     }
     // Home-made solution
     function findBoundingClientRect(obj) {
     var offsetLeft = 0, offsetTop = 0;
     do {
     offsetLeft += (obj.offsetLeft || 0);
     offsetTop += (obj.offsetTop || 0);
     while (obj.offsetParent) {
     obj = obj.offsetParent;
     offsetLeft += obj.offsetLeft;
     offsetTop += obj.offsetTop;
     }
     } while (obj = obj.parentNode);
     return {
     left:offsetLeft,
     top:offsetTop
     };
     }
     function getPathValue(path, key) {
     var box, value;
     if (a4p.isDefinedAndNotNull(path)) {
     var node = eval("resizer.DOMelement."+path);
     if (key == 'offsetTop') {
     box = findBoundingClientRect(node);
     return box.top;
     } else if (key == 'offsetLeft') {
     box = findBoundingClientRect(node);
     return box.left;
     } else {
     return node[key];
     }
     } else {
     if (a4p.isDefined(attrIndex['@'+resizer.id+'.'+key])) {
     return attrIndex['@'+resizer.id+'.'+key];
     } else {
     if (key == 'offsetTop') {
     box = findBoundingClientRect(resizer.DOMelement);
     attrIndex['@'+resizer.id+'.offsetTop'] = box.top;
     attrIndex['@'+resizer.id+'.offsetLeft'] = box.left;
     return box.top;
     } else if (key == 'offsetLeft') {
     box = findBoundingClientRect(resizer.DOMelement);
     attrIndex['@'+resizer.id+'.offsetTop'] = box.top;
     attrIndex['@'+resizer.id+'.offsetLeft'] = box.left;
     return box.left;
     } else {
     value = eval("resizer.DOMelement."+key);
     attrIndex['@'+resizer.id+'.'+key] = value;
     return value;
     }
     }
     }
     }
     */
    Resize.prototype.getPathValue = function (path, key) {
        var value = 0, node;
        try {
            if (a4p.isTrueOrNonEmpty(path)) {
                if (a4p.isDefined(attrIndex['@' + this.id + '.' + path + '.' + key])) {
                    value = attrIndex['@' + this.id + '.' + path + '.' + key];
                } else {
                    node = eval("this.DOMelement." + path);
                    if (Resize.isReordering) this.addDependentNode(node);
                    value = node[key];
                    if (a4p.isDefined(listenersIndex[this.name]) && (listenersIndex[this.name].id == this.id)) {
                        attrIndex['@' + this.name + '.' + path + '.' + key] = value;
                    }
                    attrIndex['@' + this.id + '.' + path + '.' + key] = value;
                    //a4p.InternalLog.log('a4p.Resize .' + this.name, 'getPathValue('+path+', '+key+')='+value);
                    return value;
                }
            } else {
                if (a4p.isDefined(attrIndex['@' + this.id + '.' + key])) {
                    value = attrIndex['@' + this.id + '.' + key];
                } else {
                    node = this.DOMelement;
                    value = node[key];
                    if (a4p.isDefined(listenersIndex[this.name]) && (listenersIndex[this.name].id == this.id)) {
                        attrIndex['@' + this.name + '.' + key] = value;
                    }
                    attrIndex['@' + this.id + '.' + key] = value;
                    //a4p.InternalLog.log('a4p.Resize ..' + this.name, 'getPathValue('+path+', '+key+')='+value);
                    return value;
                }
            }
        } catch (e) {
            a4p.ErrorLog.log('a4p.Resize ' + this.name,
                'getPathValue(' + path + ', ' + key + ') has invalid parameters : ' + e.message);
        }
        return value;
    };

    Resize.prototype.addDependentNode = function (node) {
        var nodeResize = null;
        for (var i = 0, nb = rootListener.length; i < nb; i++) {
            if (rootListener[i].DOMelement == node) {
                nodeResize = rootListener[i];
                break;
            }
        }
        if (nodeResize) {
            if (listenersIndex[nodeResize.name].id == nodeResize.id) {
                if (a4p.isUndefined(this.nodeIndex[nodeResize.name])) {
                    this.nodeIndex[nodeResize.name] = true;
                    this.nodeList.push(nodeResize.name);
                }
                if (a4p.isUndefined(this.nodeIndex[nodeResize.id])) {
                    this.nodeIndex[nodeResize.id] = true;
                }
            } else {
                if (a4p.isUndefined(this.nodeIndex[nodeResize.id])) {
                    this.nodeIndex[nodeResize.id] = true;
                    this.nodeList.push(nodeResize.id);
                }
            }
        }
    };

    Resize.prototype.addScopeVar = function (key, fn) {
        this.scope[key] = 0;
        // Determine if this value depends on other nodes or not
        this.tmpNodeDependent = false;
        fn(this.scope, {});
        this.scopeVars.push({key: key, fn: fn, nodeDependent: this.tmpNodeDependent});
    };

    Resize.prototype.addCssKey = function (key, fn) {
        // Determine if this value depends on other nodes or not
        this.tmpNodeDependent = false;
        fn(this.scope, {});
        if (!this.tmpNodeDependent) {
            a4p.ErrorLog.log('a4p.Resize', 'USELESS resize-css-' + key + ' option in resizer ' + this.name
                + ' : try to use style="' + key + ':..." or ng-style="{' + key
                + ':getResize...()+\'px\'}" to calculate it asap.');
            // ng-style="{width:getResizeWidth()+'px', height:getResizeHeight()+'px'}"
            // ng-style="{minHeight:getResizeHeight()+'px'}"
        }
        this.cssKeys.push({key: key, fn: fn, nodeDependent: this.tmpNodeDependent});
    };

    Resize.prototype.dependingOnNodes = function () {
        var key, fn;
        this.nodeList = [];
        this.nodeIndex = {};
        for (var varIdx = 0, varNb = this.scopeVars.length; varIdx < varNb; varIdx++) {
            key = this.scopeVars[varIdx].key;
            fn = this.scopeVars[varIdx].fn;
            //this.scope[key] = 0;
            fn(this.scope, {});
        }
        for (var cssIdx = 0, cssNb = this.cssKeys.length; cssIdx < cssNb; cssIdx++) {
            key = this.cssKeys[cssIdx].key;
            fn = this.cssKeys[cssIdx].fn;
            fn(this.scope, {});
        }
        return this.nodeList;
    };

    Resize.prototype.resize = function () {
        if (this.scopeVars.length > 0) {
            Resize.refreshAll();
            return true;
        }
        if (this.cssKeys.length > 0) {
            Resize.refreshAll();
            return true;
        }
        return false;
    };

    Resize.refreshAll = a4p.delay(refreshAllTimeout, 10); //300 ?
    Resize.windowAll = a4p.delay(windowAllTimeout, 10); //300 ?

    /*
     var windowTimer = null;
     Resize.clearWindowAll = function () {
     if (windowTimer != null) window.clearTimeout(windowTimer);
     windowTimer = null;
     };
     Resize.windowAll = function () {
     // Delay timer to be sure it will trigger ONLY after all resizers are up to date
     if (windowTimer != null) window.clearTimeout(windowTimer);
     windowTimer = window.setTimeout(function () {
     windowTimer = null;
     windowAllTimeout();
     }, 300);
     };
     */
    Resize.handleDocOrientationChange = function () {
        window.setTimeout(Resize.handleDocOrientationChangeDelay, 750);
    };

    Resize.handleDocOrientationChangeDelay = function () {
        // Pour forcer la page a avoir la taille du viewscreen (pour eviter d'avoir le scroll du browser)
        var html = document.documentElement;
        // BEWARE : width and height are switched under Android for example, but not all the times !!!
        // BEWARE : orientation is undefined under PC Chrome for example, and width and height are right !!!
        // => memorize the RIGHT ratio and orientation pairing at start : the sole moment where all is right
        // NO MORE VALID BECAUSE orientation == 0 at start under new Android for every orientations (then false value !)
        if (Resize.initWidth == 0) {
            a4p.InternalLog.log('a4p.Resize', 'INIT orientationChange : window.orientation=' + window.orientation
                + ', window.innerWidth=' + window.innerWidth + ', window.outerWidth=' + window.outerWidth
                + ', screen.width=' + screen.width + ', html.clientWidth=' + html.clientWidth
                + ', window.innerHeight=' + window.innerHeight + ', window.outerHeight=' + window.outerHeight
                + ', screen.height=' + screen.height + ', html.clientHeight=' + html.clientHeight);
            Resize.initWidth = html.clientWidth;
            if ((window.innerWidth > 0) && (window.innerWidth < Resize.initWidth)) {
                // In IOS, html attributes are no right the first time (ex: 1024*1024), while window.inner attributes seem better (ex: 1024*768).
                // Beware window.outer attributes are as false as html attributes (ex: 1024*1024)
                Resize.initWidth = window.innerWidth;
            }
            Resize.resizeWidth = Resize.initWidth;
            Resize.initHeight = html.clientHeight;
            if ((window.innerHeight > 0) && (window.innerHeight < Resize.initHeight)) {
                // In IOS, html attributes are no right the first time (ex: 1024*1024), while window attributes seem better (ex: 1024*768).
                // Beware window.outer attributes are as false as html attributes (ex: 1024*1024)
                Resize.initHeight = window.innerHeight;
            }
            Resize.resizeHeight = Resize.initHeight;
            // NB : screen attributes does not exist everywhere and seem not orientation dependent
            Resize.initOrientation = window.orientation;// 0 up, 90 left, -90 right, 180 down
            if (a4p.isUndefined(Resize.initOrientation) || (Resize.initOrientation == 0) || (Resize.initOrientation == 180)) {
                // Up or down side => orientation IS currently the default device orientation
                // At start, width and height are in their right place
                Resize.initPortrait = (Resize.initWidth < Resize.initHeight);
                Resize.initPortrait0Orientation = Resize.initPortrait;
            } else {
                // left or right side => orientation is NOT currently the default device orientation
                // At start, width and height are in their right place
                Resize.initPortrait = (Resize.initWidth < Resize.initHeight);
                Resize.initPortrait0Orientation = !Resize.initPortrait;
            }
            Resize.resizePortrait = Resize.initPortrait;
            Resize.resizeOrientation = (Resize.initPortrait ? 'portrait' : 'landscape');
            a4p.InternalLog.log('a4p.Resize', 'INIT orientation : initOrientation=' + Resize.initOrientation
                + ', initWidth=' + Resize.initWidth + ', initHeight=' + Resize.initHeight
                + ', initPortrait=' + Resize.initPortrait + ', initPortrait0Orientation=' + Resize.initPortrait0Orientation);
            // TODO : save that in local storage, because orientation changes are not detected while application is paused
        } else {
            a4p.InternalLog.log('a4p.Resize', 'orientationChange : window.orientation=' + window.orientation
                + ', window.innerWidth=' + window.innerWidth + ', window.outerWidth=' + window.outerWidth
                + ', screen.width=' + screen.width + ', html.clientWidth=' + html.clientWidth
                + ', window.innerHeight=' + window.innerHeight + ', window.outerHeight=' + window.outerHeight
                + ', screen.height=' + screen.height + ', html.clientHeight=' + html.clientHeight);
            var initWidth = html.clientWidth;
            if ((window.innerWidth > 0) && (window.innerWidth < initWidth)) {
                // In IOS, html attributes are no right the first time (ex: 1024*1024), while window.inner attributes seem better (ex: 1024*768).
                // Beware window.outer attributes are as false as html attributes (ex: 1024*1024)
                initWidth = window.innerWidth;
            }
            var initHeight = html.clientHeight;
            if ((window.innerHeight > 0) && (window.innerHeight < initHeight)) {
                // In IOS, html attributes are no right the first time (ex: 1024*1024), while window attributes seem better (ex: 1024*768).
                // Beware window.outer attributes are as false as html attributes (ex: 1024*1024)
                initHeight = window.innerHeight;
            }
            if (a4p.isUndefined(window.orientation)) {
                // NO orientation change (desktop) => orientation IS determined by ratio width/height
                Resize.resizeOrientation = ((initWidth < initHeight) ? 'portrait' : 'landscape');
                Resize.resizePortrait = (initWidth < initHeight);
            } else {
                // Detect if initOrientation is valid or not by keeping priority for ratio width/height if all 4 are same
                if ((initWidth < initHeight)
                    && (window.innerWidth < window.innerHeight)
                    && (window.outerWidth < window.outerHeight)
                    && (html.clientWidth < html.clientHeight)) {
                    Resize.resizeOrientation = 'portrait';
                    Resize.resizePortrait = true;
                } else if ((initWidth >= initHeight)
                    && (window.innerWidth >= window.innerHeight)
                    && (window.outerWidth >= window.outerHeight)
                    && (html.clientWidth >= html.clientHeight)) {
                    Resize.resizeOrientation = 'landscape';
                    Resize.resizePortrait = false;
                } else {
                    if ((window.orientation == 0) || (window.orientation == 180)) {
                        // Up or down side => orientation IS currently the same as INITIALLY
                        Resize.resizeOrientation = (Resize.initPortrait0Orientation ? 'portrait' : 'landscape');
                        Resize.resizePortrait = Resize.initPortrait0Orientation;
                    } else {
                        // left or right side => orientation is NOT currently the same as INITIALLY
                        Resize.resizeOrientation = (Resize.initPortrait0Orientation ? 'landscape' : 'portrait');
                        Resize.resizePortrait = !Resize.initPortrait0Orientation;
                    }
                }
            }
            if (Resize.resizePortrait) {
                // Width is the smallest value between initWidth and initHeight
                // Height is the biggest value between initWidth and initHeight
                Resize.resizeWidth = (initWidth < initHeight) ? initWidth : initHeight;
                Resize.resizeHeight = (initWidth < initHeight) ? initHeight : initWidth;
            } else {
                // Width is the biggest value between initWidth and initHeight
                // Height is the smallest value between initWidth and initHeight
                Resize.resizeWidth = (initWidth >= initHeight) ? initWidth : initHeight;
                Resize.resizeHeight = (initWidth >= initHeight) ? initHeight : initWidth;
            }
        }

        //MLE #193 document.body.style.width = Resize.resizeWidth + 'px';
        //MLE #193 document.body.style.height = Resize.resizeHeight + 'px';


        //document.body.setAttribute("class", Resize.resizeOrientation);
        //document.body.setAttribute("orient", Resize.resizeOrientation);
        /*
         switch (window.orientation) {
         case 0:
         Resize.resizeOrientation = "portrait";
         document.body.setAttribute("orient", Resize.resizeOrientation);
         break;
         case -90:
         Resize.resizeOrientation = "landscape";
         document.body.setAttribute("orient", Resize.resizeOrientation);
         break;
         case 90:
         Resize.resizeOrientation = "landscape";
         document.body.setAttribute("orient", Resize.resizeOrientation);
         break;
         case 180:
         Resize.resizeOrientation = "portrait";
         document.body.setAttribute("orient", Resize.resizeOrientation);
         break;
         }
         */
        if (Resize.resizeWidth < 500) {// 768
            Resize.resizeOneColumn = true;
            document.body.setAttribute("resizeOneColumn", "1");
        } else {
            Resize.resizeOneColumn = false;
            document.body.setAttribute("resizeOneColumn", "0");
        }
        a4p.InternalLog.log('a4p.Resize', 'orientationChange : resizeOrientation=' + Resize.resizeOrientation
            + ', resizePortrait=' + Resize.resizePortrait + ', resizeOneColumn=' + Resize.resizeOneColumn
            + ', resizeWidth=' + Resize.resizeWidth + ', resizeHeight=' + Resize.resizeHeight);


        // Triggers listeners BEFORE updating Resizers
        for (var idx = 0, nb = rootListener.length; idx < nb; idx++) {
            var resizer = rootListener[idx];
            resizer.triggerEvent(EVT_BEFORE_WINDOW, {
                id: resizer.id,
                name: resizer.name,
                resizeOrientation: Resize.resizeOrientation,
                resizePortrait: Resize.resizePortrait,
                resizeOneColumn: Resize.resizeOneColumn,
                resizeWidth: Resize.resizeWidth,
                resizeHeight: Resize.resizeHeight
            });
        }
        // BEWARE : we MUST update resizers BEFORE transmitting event to Sense which will refresh SCROLLERS, or else maxScrollX==WrapperW-ScrollerW are false
        orientationChangeEvent = true;
        Resize.refreshAll();
    };

    /**
     * Integration with angular directives
     *
     * @param directiveModule
     */
    Resize.declareDirectives = function (directiveModule) {
        angular.forEach([EVT_BEFORE_WINDOW, EVT_WINDOW, EVT_CHANGED], function (name) {
            var directiveName = "resize" + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            var eventName = name.charAt(0).toUpperCase() + name.slice(1);
            directiveModule.directive(directiveName, ['$parse', '$rootScope', function ($parse, $rootScope) {
                return function (scope, element, attr) {
                    // Create only 1 Resize object for this DOM element
                    var resize = element.data("resize");
                    if (a4p.isUndefined(resize)) {
                        resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                        var initFn = $parse(resize.options['init']);
                        initFn(scope, {$resize: resize});
                    }
                    var fn = $parse(attr[directiveName]);
                    resize['on' + eventName] = function (event) {
                        if (resize.options['callApply']) {
                            a4p.safeApply(scope, function () {
                                fn(scope, {$event: event});
                            });
                        } else {
                            fn(scope, {$event: event});
                        }
                    };
                };
            }]);
        });
        directiveModule.directive('resizeOpts', ['$parse', '$rootScope', function ($parse, $rootScope) {
            return function (scope, element, attr) {
                // Create only 1 Resize object for this DOM element
                var resize = element.data("resize");
                if (a4p.isUndefined(resize)) {
                    resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(resize.options['init']);
                    initFn(scope, {$resize: resize});
                }
            };
        }]);
        directiveModule.directive('resizeVars', ['$parse', '$rootScope', function ($parse, $rootScope) {
            return function (scope, element, attr) {
                // Create only 1 Resize object for this DOM element
                var resize = element.data("resize");
                if (a4p.isUndefined(resize)) {
                    resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(resize.options['init']);
                    initFn(scope, {$resize: resize});
                }
                var vars = $parse(attr['resizeVars'])(scope, {});
                for (var varName in vars) {
                    if (!vars.hasOwnProperty(varName)) continue;
                    var fn = $parse(vars[varName]);
                    resize.addScopeVar(varName, fn);
                }
            };
        }]);
        angular.forEach(['top', 'left', 'width', 'height', 'lineHeight', 'minHeight', 'minWidth'], function (name) {
            var directiveName = "resizecss" + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            directiveModule.directive(directiveName, ['$parse', '$rootScope', function ($parse, $rootScope) {
                return function (scope, element, attr) {
                    // Create only 1 Resize object for this DOM element
                    var resize = element.data("resize");
                    if (a4p.isUndefined(resize)) {
                        resize = Resize.newResize($parse, $rootScope, scope, element, attr);
                        var initFn = $parse(resize.options['init']);
                        initFn(scope, {$resize: resize});
                    }
                    var fn = $parse(attr[directiveName]);
                    resize.addCssKey(name, fn);
                };
            }]);
        });
    };

    Resize.newResize = function ($parse, $rootScope, scope, element, attr) {
        var resize;
        var opts = {};
        if (a4p.isDefined(attr['resizeOpts'])) {
            opts = $parse(attr['resizeOpts'])(scope, {});
        }
        resize = new a4p.Resize($rootScope, scope, element, opts);
        element.data("resize", resize);
        // User function callable from Angular context
        scope.getResizeOrientation = function () {
            return Resize.resizeOrientation;// document orientation
        };
        scope.getResizePortrait = function () {
            return Resize.resizePortrait;// document orientation is portrait ?
        };
        scope.getResizeOneColumn = function () {
            return Resize.resizeOneColumn;
        };
        scope.getResizeWidth = function () {
            return Resize.resizeWidth;// document width
        };
        scope.getResizeHeight = function () {
            return Resize.resizeHeight;// document height
        };
        scope.getResizeId = function () {
            return resize.id;
        };
        scope.getResizeName = function () {
            return resize.name;
        };
        scope.getPathValue = function (path, key) {
            resize.tmpNodeDependent = true;
            return resize.getPathValue(path, key);
        };
        scope.getResizePathValue = function (name, path, key) {
            resize.tmpNodeDependent = true;
            var resizer = listenersIndex[name];
            if (a4p.isDefined(resizer)) {
                if (Resize.isReordering) resize.addDependentNode(resizer.DOMelement);
                return resizer.getPathValue(path, key);
            } else {
                return 0;
            }
        };
        scope.resizeRefresh = function () {
            // DO NOT TRIGGER EVT_WINDOW because we are in a manual refresh
            resize.resize();
        };
        if (a4p.isDefined(resize.options['watchRefresh'])) {
            if (typeof resize.options['watchRefresh'] == "string") {
                scope.$watch(resize.options['watchRefresh'], function (newValue, oldValue) {
                    //a4p.InternalLog.log('a4p.resize','watchRefresh '+resize.options['watchRefresh']+' : '+oldValue+' > '+newValue);
                    if (newValue === oldValue) return; // initialization
                    resize.resize();
                });
            } else {
                for (var i = 0, nb = resize.options['watchRefresh'].length; i < nb; i++) {
                    scope.$watch(resize.options['watchRefresh'][i], function (newValue, oldValue) {
                        //a4p.InternalLog.log('a4p.resize','watchRefresh '+resize.options['watchRefresh'][i]+' : '+oldValue+' > '+newValue);
                        if (newValue === oldValue) return; // initialization
                        resize.resize();
                    });
                }
            }
        }
        Resize.refreshAll();
        //a4p.InternalLog.log('a4p.Resize ' + this.name, 'new Resize');
        return resize;
    };

    Resize.getResize = function (name) {
        if (a4p.isDefined(listenersIndex[name])) {
            return listenersIndex[name];
        } else {
            return null;
        }
    };

    return Resize;
})(navigator, window, document);

'use strict';

// Namespace a4p
var a4p;
if (!a4p) a4p = {};

/**
 * Management of scrolling
 */
a4p.Scroll = (function (navigator, window, document) {

    function scrollbarH(self) {
        if (!self.hScrollbar) {
            if (self.hScrollbarWrapper) {
                if (miapp.BrowserCapabilities.hasTransform) {
                    self.hScrollbarIndicator.style[miapp.BrowserCapabilities.transform] = '';
                }
                self.DOMelement.removeChild(self.hScrollbarWrapper);
                self.hScrollbarWrapper = null;
                self.hScrollbarIndicator = null;
            }
            return;
        }
        if (!self.hScrollbarWrapper) {
            // Create the scrollbar wrapper
            var bar = document.createElement('div');
            if (self.options.scrollbarClass) {
                bar.className = self.options.scrollbarClass + 'H';
            } else {
                bar.style.position = 'absolute';
                bar.style.zIndex = '100';
                bar.style.height = '7px';
                bar.style.bottom = '1px';
                bar.style.left = '2px';
                bar.style.right = (self.vScrollbar ? '7' : '2') + 'px';
                /*
                 bar.style.cssText = 'position:absolute;z-index:100;'
                 + 'height:7px;bottom:1px;left:2px;right:' + (self.vScrollbar ? '7' : '2') + 'px';
                 */
            }
            bar.style.overflow = 'hidden';
            bar.style.opacity = (self.options.hideScrollbar ? '0' : '1');
            bar.style.pointerEvents = 'none';
            bar.style[miapp.BrowserCapabilities.transitionProperty] = 'opacity';
            bar.style[miapp.BrowserCapabilities.transitionDuration] = (self.options.fadeScrollbar ? '350ms' : '0ms');
            /*
             bar.style.cssText += ';pointer-events:none;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-property:opacity;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-duration:'
             + (self.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:'
             + (self.options.hideScrollbar ? '0' : '1');
             */
            self.DOMelement.appendChild(bar);
            self.hScrollbarWrapper = bar;
            // Create the scrollbar indicator
            bar = document.createElement('div');
            if (!self.options.scrollbarClass) {
                bar.style.position = 'absolute';
                bar.style.zIndex = '100';
                bar.style.height = '100%';
                bar.style.backgroundColor = 'rgba(0,0,0,0.5)';
                bar.style.borderWidth = '1px';
                bar.style.borderStyle = 'solid';
                bar.style.borderColor = 'rgba(255,255,255,0.9)';
                bar.style[miapp.BrowserCapabilities.vendor + 'BackgroundClip'] = 'padding-box';
                bar.style.boxSizing = 'border-box';
                bar.style[miapp.BrowserCapabilities.vendor + 'BoxSizing'] = 'border-box';
                bar.style.borderRadius = '3px';
                bar.style[miapp.BrowserCapabilities.vendor + 'BorderRadius'] = '3px';
                /*
                 bar.style.cssText =
                 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);'
                 + miapp.BrowserCapabilities.cssVendor + 'background-clip:padding-box;'
                 + miapp.BrowserCapabilities.cssVendor + 'box-sizing:border-box;'
                 + 'height:100%;'
                 + miapp.BrowserCapabilities.cssVendor + 'border-radius:3px;border-radius:3px';
                 */
            }
            bar.style.pointerEvents = 'none';
            bar.style[miapp.BrowserCapabilities.transitionProperty] = miapp.BrowserCapabilities.cssVendor + 'transform';
            bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
            bar.style[miapp.BrowserCapabilities.transitionDuration] = '0ms';
            bar.style[miapp.BrowserCapabilities.transform] = 'translate(0,0)' + miapp.BrowserCapabilities.translateZ;
            /*
             bar.style.cssText += ';pointer-events:none;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-property:'
             + miapp.BrowserCapabilities.cssVendor + 'transform;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);'
             + miapp.BrowserCapabilities.cssVendor + 'transition-duration:0;'
             + miapp.BrowserCapabilities.cssVendor + 'transform: translate(0,0)' + miapp.BrowserCapabilities.translateZ;
             */
            if (self.options.useTransition) {
                bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
                /*
                 bar.style.cssText += ';'
                 + miapp.BrowserCapabilities.cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';
                 */
            }
            self.hScrollbarWrapper.appendChild(bar);
            self.hScrollbarIndicator = bar;
        }
        var margins = 2 + (self.vScrollbar ? 7 : 2);
        self.hScrollbarWrapper.style.width = (self.wrapperW - margins) + 'px';
        self.hScrollbarIndicatorSize = Math.max(Math.round((self.wrapperW - margins) * self.wrapperW / self.scrollerW), 8);
        self.hScrollbarIndicator.style.width = self.hScrollbarIndicatorSize + 'px';
        self.hScrollbarMaxScroll = (self.wrapperW - margins) - self.hScrollbarIndicatorSize;
        self.hScrollbarProp = self.hScrollbarMaxScroll / self.maxScrollX;
        // Reset position
        scrollbarPosH(self, true);
    }

    function scrollbarV(self) {
        if (!self.vScrollbar) {
            if (self.vScrollbarWrapper) {
                if (miapp.BrowserCapabilities.hasTransform) self.vScrollbarIndicator.style[miapp.BrowserCapabilities.transform] = '';
                self.DOMelement.removeChild(self.vScrollbarWrapper);
                self.vScrollbarWrapper = null;
                self.vScrollbarIndicator = null;
            }
            return;
        }
        if (!self.vScrollbarWrapper) {
            // Create the scrollbar wrapper
            var bar = document.createElement('div');
            if (self.options.scrollbarClass) {
                bar.className = self.options.scrollbarClass + 'V';
            } else {
                bar.style.position = 'absolute';
                bar.style.zIndex = '100';
                bar.style.width = '7px';
                bar.style.right = '1px';
                bar.style.top = '2px';
                bar.style.bottom = (self.hScrollbar ? '7' : '2') + 'px';
                /*
                 bar.style.cssText = 'position:absolute;z-index:100;'
                 + 'width:7px;bottom:' + (self.hScrollbar ? '7' : '2') + 'px;top:2px;right:1px';
                 */
            }
            bar.style.overflow = 'hidden';
            bar.style.opacity = (self.options.hideScrollbar ? '0' : '1');
            bar.style.pointerEvents = 'none';
            bar.style[miapp.BrowserCapabilities.transitionProperty] = 'opacity';
            bar.style[miapp.BrowserCapabilities.transitionDuration] = (self.options.fadeScrollbar ? '350ms' : '0ms');
            /*
             bar.style.cssText += ';pointer-events:none;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-property:opacity;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-duration:'
             + (self.options.fadeScrollbar ? '350ms' : '0') + ';overflow:hidden;opacity:'
             + (self.options.hideScrollbar ? '0' : '1');
             */
            self.DOMelement.appendChild(bar);
            self.vScrollbarWrapper = bar;
            // Create the scrollbar indicator
            bar = document.createElement('div');
            if (!self.options.scrollbarClass) {
                bar.style.position = 'absolute';
                bar.style.zIndex = '100';
                bar.style.width = '100%';
                bar.style.backgroundColor = 'rgba(0,0,0,0.5)';
                bar.style.borderWidth = '1px';
                bar.style.borderStyle = 'solid';
                bar.style.borderColor = 'rgba(255,255,255,0.9)';
                bar.style[miapp.BrowserCapabilities.vendor + 'BackgroundClip'] = 'padding-box';
                bar.style.boxSizing = 'border-box';
                bar.style[miapp.BrowserCapabilities.vendor + 'BoxSizing'] = 'border-box';
                bar.style.borderRadius = '3px';
                bar.style[miapp.BrowserCapabilities.vendor + 'BorderRadius'] = '3px';
                /*
                 bar.style.cssText =
                 'position:absolute;z-index:100;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);'
                 + miapp.BrowserCapabilities.cssVendor + 'background-clip:padding-box;'
                 + miapp.BrowserCapabilities.cssVendor + 'box-sizing:border-box;'
                 + 'width:100%;'
                 + miapp.BrowserCapabilities.cssVendor + 'border-radius:3px;border-radius:3px';
                 */
            }
            bar.style.pointerEvents = 'none';
            bar.style[miapp.BrowserCapabilities.transitionProperty] = miapp.BrowserCapabilities.cssVendor + 'transform';
            bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
            bar.style[miapp.BrowserCapabilities.transitionDuration] = '0ms';
            bar.style[miapp.BrowserCapabilities.transform] = 'translate(0,0)' + miapp.BrowserCapabilities.translateZ;
            /*
             bar.style.cssText += ';pointer-events:none;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-property:'
             + miapp.BrowserCapabilities.cssVendor + 'transform;'
             + miapp.BrowserCapabilities.cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1);'
             + miapp.BrowserCapabilities.cssVendor + 'transition-duration:0;'
             + miapp.BrowserCapabilities.cssVendor + 'transform: translate(0,0)' + miapp.BrowserCapabilities.translateZ;
             */
            if (self.options.useTransition) {
                bar.style[miapp.BrowserCapabilities.transitionTimingFunction] = 'cubic-bezier(0.33,0.66,0.66,1)';
                /*
                 bar.style.cssText += ';'
                 + miapp.BrowserCapabilities.cssVendor + 'transition-timing-function:cubic-bezier(0.33,0.66,0.66,1)';
                 */
            }
            self.vScrollbarWrapper.appendChild(bar);
            self.vScrollbarIndicator = bar;
        }
        var margins = 2 + (self.hScrollbar ? 7 : 2);
        self.vScrollbarWrapper.style.height = (self.wrapperH - margins) + 'px';
        self.vScrollbarIndicatorSize = Math.max(Math.round((self.wrapperH - margins) * self.wrapperH / self.scrollerH), 8);
        self.vScrollbarIndicator.style.height = self.vScrollbarIndicatorSize + 'px';
        self.vScrollbarMaxScroll = (self.wrapperH - margins) - self.vScrollbarIndicatorSize;
        self.vScrollbarProp = self.vScrollbarMaxScroll / self.maxScrollY;
        // Reset position
        scrollbarPosV(self, true);
    }

    function pos(self, x, y, reset) {
        if (self.zoomed) return;

        var deltaX = self.hScroll ? (x - self.x) : 0;
        var deltaY = self.vScroll ? (y - self.y) : 0;
        if (!reset && self.options.onBeforeScrollMove) {
            self.options.onBeforeScrollMove.call(self, deltaX, deltaY);
            x = self.x + deltaX;
            y = self.y + deltaY;
        }

        x = self.hScroll ? x : 0;
        y = self.vScroll ? y : 0;

        if (self.options.useTransform) {
            self.scroller.style[miapp.BrowserCapabilities.transform] =
                'translate(' + x + 'px,' + y + 'px) scale(' + self.scale + ')' + miapp.BrowserCapabilities.translateZ;
        } else {
            x = Math.round(x);
            y = Math.round(y);
            self.scroller.style.left = x + 'px';
            self.scroller.style.top = y + 'px';
        }

        self.x = x;
        self.y = y;
        //console.log('Scroll : pos() x=' + x + ' y=' + y);

        scrollbarPosH(self);
        scrollbarPosV(self);
    }

    function scrollbarPosH(self, hidden) {
        var pos = self.x,
            size;

        if (!self.hScrollbar) return;

        pos = self.hScrollbarProp * pos;

        if (pos < 0) {
            if (!self.options.fixedScrollbar) {
                size = self.hScrollbarIndicatorSize + Math.round(pos * 3);
                if (size < 8) size = 8;
                self.hScrollbarIndicator.style.width = size + 'px';
            }
            pos = 0;
        } else if (pos > self.hScrollbarMaxScroll) {
            if (!self.options.fixedScrollbar) {
                size = self.hScrollbarIndicatorSize - Math.round((pos - self.hScrollbarMaxScroll) * 3);
                if (size < 8) size = 8;
                self.hScrollbarIndicator.style.width = size + 'px';
                pos = self.hScrollbarMaxScroll + (self.hScrollbarIndicatorSize - size);
            } else {
                pos = self.hScrollbarMaxScroll;
            }
        }

        self.hScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = '0';
        self.hScrollbarWrapper.style.opacity = (hidden && self.options.hideScrollbar) ? '0' : '1';
        self.hScrollbarIndicator.style[miapp.BrowserCapabilities.transform] =
            'translate(' + pos + 'px,0)' + miapp.BrowserCapabilities.translateZ;
    }

    function scrollbarPosV(self, hidden) {
        var pos = self.y, size;

        if (!self.vScrollbar) return;

        pos = self.vScrollbarProp * pos;

        if (pos < 0) {
            if (!self.options.fixedScrollbar) {
                size = self.vScrollbarIndicatorSize + Math.round(pos * 3);
                if (size < 8) size = 8;
                self.vScrollbarIndicator.style.height = size + 'px';
            }
            pos = 0;
        } else if (pos > self.vScrollbarMaxScroll) {
            if (!self.options.fixedScrollbar) {
                size = self.vScrollbarIndicatorSize - Math.round((pos - self.vScrollbarMaxScroll) * 3);
                if (size < 8) size = 8;
                self.vScrollbarIndicator.style.height = size + 'px';
                pos = self.vScrollbarMaxScroll + (self.vScrollbarIndicatorSize - size);
            } else {
                pos = self.vScrollbarMaxScroll;
            }
        }

        self.vScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = '0';
        self.vScrollbarWrapper.style.opacity = (hidden && self.options.hideScrollbar) ? '0' : '1';
        self.vScrollbarIndicator.style[miapp.BrowserCapabilities.transform] =
            'translate(0,' + pos + 'px)' + miapp.BrowserCapabilities.translateZ;
    }

    function resetPos(self, time) {
        var resetX = self.x >= 0 ? 0 : self.x < self.maxScrollX ? self.maxScrollX : self.x,
            resetY = self.y >= -self.options.topOffset || self.maxScrollY > 0 ? -self.options.topOffset : self.y < self.maxScrollY ? self.maxScrollY : self.y;

        if (resetX == self.x && resetY == self.y) {
            if (self.moved) {
                self.moved = false;
                if (self.options.onAfterScrollEnd) {
                    self.options.onAfterScrollEnd.call(self);
                }
            }

            if (self.hScrollbar && self.options.hideScrollbar) {
                if (miapp.BrowserCapabilities.vendor == 'webkit') self.hScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = '300ms';
                self.hScrollbarWrapper.style.opacity = '0';
            }
            if (self.vScrollbar && self.options.hideScrollbar) {
                if (miapp.BrowserCapabilities.vendor == 'webkit') self.vScrollbarWrapper.style[miapp.BrowserCapabilities.transitionDelay] = '300ms';
                self.vScrollbarWrapper.style.opacity = '0';
            }

            return;
        }

        // Do not call onBeforeMove() because it's a reset
        //console.log('Scroll : resetPos() scrollTo x=' + resetX + ' y=' + resetY);
        self.scrollTo(resetX, resetY, time || 0, false, true);
    }

    function transitionEnd(self, e) {
        if (e.target != self.scroller) return;
        if (self.bindTransitionEnd) {
            self.bindTransitionEnd.destroy();
            self.bindTransitionEnd = null;
        }
        startAni(self);
    }

    function startAni(self) {
        if (self.animating) return;

        if (!self.steps.length) {
            resetPos(self, 400);
            return;
        }

        var startTime = (new Date()).getTime();
        var step = self.steps.shift();
        //console.log('Scroll : startAni() steps.shift : deltaX=' + step.deltaX + ' deltaY=' + step.deltaY);

        if (step.deltaX == 0 && step.deltaY == 0) step.time = 0;

        self.animating = true;
        self.moved = true;

        if (self.options.useTransition) {
            transitionTime(self, step.time);
            //console.log('Scroll : startAni() x=' + (self.x + step.deltaX) + ' y=' + (self.y + step.deltaY));
            pos(self, self.x + step.deltaX, self.y + step.deltaY, step.reset);
            self.animating = false;
            if (step.time) {
                var handler = function (evt) {
                    transitionEnd(self, evt);
                };
                self.scroller.addEventListener(miapp.BrowserCapabilities.TRNEND_EVENT, handler, false);
                self.bindTransitionEnd = {
                    destroy: function () {
                        self.scroller.removeEventListener(miapp.BrowserCapabilities.TRNEND_EVENT, handler, false);
                    }
                }
            }
            else resetPos(self, 0);
        } else {
            var animate = function () {
                var now = (new Date()).getTime();
                if ((now >= startTime + step.time) || ((step.deltaX < 5) && (step.deltaX > -5) && (step.deltaY < 5) && (step.deltaY > -5))) {
                    //console.log('Scroll : animate1() x=' + (self.x + step.deltaX) + ' y=' + (self.y + step.deltaY));
                    pos(self, self.x + step.deltaX, self.y + step.deltaY, step.reset);
                    self.animating = false;
                    // Execute next animation step
                    startAni(self);
                } else {
                    var ratio = (now - startTime) / step.time;
                    //var easeOut = Math.sqrt(1 - (1-ratio) * (1-ratio));
                    var easeOut = Math.sqrt(ratio);
                    var deltaX = Math.floor(step.deltaX * easeOut);
                    var deltaY = Math.floor(step.deltaY * easeOut);
                    step.deltaX -= deltaX;
                    step.deltaY -= deltaY;
                    /*
                     now = (now - startTime) / step.time - 1;
                     easeOut = Math.sqrt(1 - now * now);
                     newX = step.deltaX * easeOut + self.x;
                     newY = step.deltaY * easeOut + self.y;
                     */
                    //console.log('Scroll : animate2() x=' + (self.x + step.deltaX) + ' y=' + (self.y + step.deltaY));
                    pos(self, self.x + deltaX, self.y + deltaY, step.reset);
                    if (self.animating) {
                        self.aniTime = miapp.BrowserCapabilities.nextFrame(animate);
                    }
                }
            };
            animate();
        }
    }

    function stopAni(self) {
        if (self.options.useTransition) {
            if (self.bindTransitionEnd) {
                self.bindTransitionEnd.destroy();
                self.bindTransitionEnd = null;
            }
        } else {
            if (self.aniTime) {
                miapp.BrowserCapabilities.cancelFrame(self.aniTime);
                self.aniTime = null;
            }
        }
    }

    function stopMomentum(self) {
        if (self.options.momentum > 0) {
            var x, y;
            if (self.options.useTransform) {
                // Very lame general purpose alternative to CSSMatrix
                var matrix = getComputedStyle(self.scroller, null)[miapp.BrowserCapabilities.transform].replace(/[^0-9\-.,]/g, '').split(',');
                x = +(matrix[12] || matrix[4] || 0);
                y = +(matrix[13] || matrix[5] || 0);
            } else {
                x = +getComputedStyle(self.scroller, null).left.replace(/[^0-9-]/g, '') || 0;
                y = +getComputedStyle(self.scroller, null).top.replace(/[^0-9-]/g, '') || 0;
            }
            if (x != self.x || y != self.y) {
                var deltaX = x - self.x;
                var deltaY = y - self.y;
                stopAni(self);
                self.steps = [];
                //console.log('Scroll : stopMomentum() x=' + (self.x + deltaX) + ' y=' + (self.y + deltaY));
                pos(self, self.x + deltaX, self.y + deltaY);
                if (self.options.onAfterScrollEnd) {
                    self.options.onAfterScrollEnd.call(self);
                }
            }
        }
    }

    function transitionTime(self, time) {
        time += 'ms';
        self.scroller.style[miapp.BrowserCapabilities.transitionDuration] = time;
        if (self.hScrollbar) self.hScrollbarIndicator.style[miapp.BrowserCapabilities.transitionDuration] = time;
        if (self.vScrollbar) self.vScrollbarIndicator.style[miapp.BrowserCapabilities.transitionDuration] = time;
    }

    function offset(self, el) {
        var left = el.offsetLeft,
            top = el.offsetTop;

        while (el = el.offsetParent) {
            left += el.offsetLeft;
            top += el.offsetTop;
        }

        if (el != self.DOMelement) {
            left *= self.scale;
            top *= self.scale;
        }

        return {left: left, top: top};
    }

    function momentumPos(self, deltaX, deltaY, time, momentum) {
        var deceleration = 0.006;
        var speedX = Math.abs(deltaX) / time;// [0.5,1.5] for mouse, 0.5 for wheel
        var speedY = Math.abs(deltaY) / time;
        if (deltaX != 0) {
            var newDistX = momentum * speedX;
            //console.log("speedX=" + speedX + ", speedY=" + speedY + ", newDistX=" + newDistX);
            //var newDistX = Math.abs(deltaX * momentum);
            // Proportionally reduce speed if we are outside of the boundaries
            if (!self.options.virtualLoop) {
                var xMaxDistUpper = -self.x;
                var xMaxDistLower = self.x - self.maxScrollX;
                if ((deltaX > 0) && (newDistX > xMaxDistUpper)) {
                    if (self.options.bounce) {
                        newDistX = xMaxDistUpper + (newDistX - xMaxDistUpper) * (newDistX - xMaxDistUpper) / self.wrapperW;
                    } else {
                        newDistX = xMaxDistUpper;
                    }
                    //console.log("slowing newDistX=" + newDistX);
                } else if ((deltaX < 0) && (newDistX > xMaxDistLower)) {
                    if (self.options.bounce) {
                        newDistX = xMaxDistLower + (newDistX - xMaxDistLower) * (newDistX - xMaxDistLower) / self.wrapperW;
                    } else {
                        newDistX = xMaxDistLower;
                    }
                    //console.log("slowing newDistX=" + newDistX);
                }
            }
            deltaX = newDistX * (deltaX < 0 ? -1 : 1);
        }
        if (deltaY != 0) {
            //console.log('Scroll : momentumPos() 1 deltaY=' + deltaY + ' time=' + time + ' momentum=' + momentum + ' speedY=' + speedY);
            var newDistY = momentum * speedY;
            //console.log("speedX=" + speedX + ", speedY=" + speedY + ", newDistY=" + newDistY);
            //var newDistY = Math.abs(deltaY * momentum);
            // Proportionally reduce speed if we are outside of the boundaries
            if (!self.options.virtualLoop) {
                var yMaxDistUpper = -self.y;
                var yMaxDistLower = self.y - self.maxScrollY;
                var ySize = self.options.bounce ? self.wrapperH : 0;
                if ((deltaY > 0) && (newDistY > yMaxDistUpper)) {
                    /*
                     newDistY *= yMaxDistUpper / newDistY;
                     yMaxDistUpper += ySize * speedY / 3;
                     speedY *= yMaxDistUpper / newDistY;
                     newDistY = yMaxDistUpper;
                     */
                    if (self.options.bounce) {
                        newDistY = yMaxDistUpper + (newDistY - yMaxDistUpper) * (newDistY - yMaxDistUpper) / self.wrapperH;
                    } else {
                        newDistY = yMaxDistUpper;
                    }
                    //console.log("slowing newDistY=" + newDistY);
                } else if ((deltaY < 0) && (newDistY > yMaxDistLower)) {
                    /*
                     yMaxDistLower = yMaxDistLower + ySize * speedY / 3;
                     speedY *= yMaxDistLower / newDistY;
                     newDistY = yMaxDistLower;
                     */
                    if (self.options.bounce) {
                        newDistY = yMaxDistLower + (newDistY - yMaxDistLower) * (newDistY - yMaxDistLower) / self.wrapperH;
                    } else {
                        newDistY = yMaxDistLower;
                    }
                    //console.log("slowing newDistY=" + newDistY);
                }
            }
            deltaY = newDistY * (deltaY < 0 ? -1 : 1);
            //console.log('Scroll : momentumPos() 2 deltaY=' + deltaY);
        }

        time = Math.round(Math.max(speedX, speedY) * momentum / deceleration);
        //time = Math.round(time * momentum);
        return {deltaX: deltaX, deltaY: deltaY, time: time};
    }

    function snapPos(self, x, y) {
        var i, l,
            page, time,
            sizeX, sizeY;

        // Check page X
        page = self.pagesX.length - 1;
        for (i = 0, l = self.pagesX.length; i < l; i++) {
            if (x >= self.pagesX[i]) {
                page = i;
                break;
            }
        }
        if (page == self.currPageX && page > 0 && self.dirX < 0) page--;
        x = self.pagesX[page];
        sizeX = Math.abs(x - self.pagesX[self.currPageX]);
        sizeX = sizeX ? Math.abs(self.x - x) / sizeX * 500 : 0;
        self.currPageX = page;

        // Check page Y
        page = self.pagesY.length - 1;
        for (i = 0; i < page; i++) {
            if (y >= self.pagesY[i]) {
                page = i;
                break;
            }
        }
        if (page == self.currPageY && page > 0 && self.dirY < 0) page--;
        y = self.pagesY[page];
        sizeY = Math.abs(y - self.pagesY[self.currPageY]);
        sizeY = sizeY ? Math.abs(self.y - y) / sizeY * 500 : 0;
        self.currPageY = page;

        // Snap with constant speed (proportional duration)
        time = Math.round(Math.max(sizeX, sizeY)) || 200;

        return {x: x, y: y, time: time};
    }

    function Scroll(element, options) {
        // JQLite element
        this.element = element;

        // DOM element
        if (typeof(element) == 'object') {
            this.DOMelement = element[0];
        } else {
            this.DOMelement = document.getElementById(element);
        }
        this.scroller = this.DOMelement.children[0];

        // Default options
        this.options = {
            name: '',

            hScroll: true,
            vScroll: true,
            x: 0,
            y: 0,
            bounce: true,
            bounceLock: false,
            momentum: 100,
            virtualLoop: false,
            useTransform: true,
            useTransition: false,
            topOffset: 0,
            bottomOffset: 0,

            // Scrollbar
            hScrollbar: true,
            vScrollbar: true,
            fixedScrollbar: miapp.BrowserCapabilities.isAndroid,
            hideScrollbar: miapp.BrowserCapabilities.isIDevice,
            fadeScrollbar: miapp.BrowserCapabilities.isIDevice && miapp.BrowserCapabilities.has3d,
            scrollbarClass: '', // Apply a css class named this value + suffixe of 'H' or 'V' to the scrollbar wrapper

            // Zoom
            zoom: false,
            zoomMin: 1,
            zoomMax: 4,
            wheelAction: 'scroll',// or 'zoom' or 'none'

            // Snap
            pageSelector: null,// string value for querySelectorAll()
            snap: false,// true to snap to pages
            snapThreshold: 1,// minimal scroll distance to trigger snap to other page (else scroller returns to start pos)

            // Events
            onRefresh: null,
            onDestroy: null,
            onBeforeScrollMove: null,
            onAfterScrollEnd: null,
            onZoomStart: null,
            onZoom: null,
            onZoomEnd: null
        };
        // User defined options
        for (var i in options) {
            if (!options.hasOwnProperty(i)) continue;
            this.options[i] = options[i];
        }
        // Normalize options
        this.options.useTransform = miapp.BrowserCapabilities.hasTransform && this.options.useTransform;
        this.options.hScrollbar = this.options.hScroll && this.options.hScrollbar;
        this.options.vScrollbar = this.options.vScroll && this.options.vScrollbar;
        if (this.options.wheelAction == 'zoom') this.options.zoom = true;
        if (this.options.zoom && !this.options.useTransform) {
            a4p.ErrorLog.log("a4p.sense", "Zoom option impossible because Browser cannot use transform");
        }
        this.options.zoom = this.options.useTransform && this.options.zoom;
        this.options.useTransition = miapp.BrowserCapabilities.hasTransitionEnd && this.options.useTransition;
        if (this.options.useTransition) this.options.fixedScrollbar = true;

        //this.minScrollY = -this.options.topOffset || 0;

        // Styling
        this.DOMelement.style.overflow = 'hidden';
        this.DOMelement.style.position = 'relative';
        /* to have scrollbar right positionned in this container */
        this.scroller.style[miapp.BrowserCapabilities.transitionProperty] =
            this.options.useTransform ? miapp.BrowserCapabilities.cssVendor + 'transform' : 'top left';
        this.scroller.style[miapp.BrowserCapabilities.transitionDuration] = '0';
        this.scroller.style[miapp.BrowserCapabilities.transformOrigin] = '0 0';
        if (this.options.useTransition) {
            this.scroller.style[miapp.BrowserCapabilities.transitionTimingFunction] =
                'cubic-bezier(0.33,0.66,0.66,1)';
        }
        if (this.options.useTransform) {
            this.scroller.style[miapp.BrowserCapabilities.transform] =
                'translate(' + this.x + 'px,' + this.y + 'px)' + miapp.BrowserCapabilities.translateZ;
        } else {
            this.scroller.style.position = 'absolute';
            this.scroller.style.top = this.y + 'px';
            this.scroller.style.left = this.x + 'px';
        }

        this.x = 0;
        this.y = 0;
        this.enabled = true;
        this.steps = [];
        this.scale = 1;
        this.currPageX = 0;
        this.currPageY = 0;
        this.pagesX = [];
        this.pagesY = [];
        this.aniTime = null;
        this.bindTransitionEnd = null;
        this.wheelZoomCount = 0;
        this.scrollCount = 0;
        this.scrollHistory = [];

        this.hScroll = false;// Flag to do horizontal scrolling on mouse/touch down/move/up or mouse wheel
        this.vScroll = false;// Flag to do vertical scrolling on mouse/touch down/move/up or mouse wheel

        this.hScrollbar = false;// Flag to show horizontal scroll bar
        this.vScrollbar = false;// Flag to show vertical scroll bar

        // Calulate other attributes
        this.refresh();
        // Set starting position without calling onBeforeMove()
        //console.log('Scroll : constructor() scrollTo x=' + this.options.x + ' y=' + this.options.y);
        this.scrollTo(this.options.x, this.options.y, 0, false, true);
    }

    Scroll.prototype.destroy = function () {
        this.scroller.style[miapp.BrowserCapabilities.transform] = '';

        // Remove the scrollbars
        this.hScrollbar = false;
        this.vScrollbar = false;
        scrollbarH(this);
        scrollbarV(this);

        if (this.bindTransitionEnd) {
            this.bindTransitionEnd.destroy();
            this.bindTransitionEnd = null;
        }

        if (this.options.onDestroy) this.options.onDestroy.call(this);
    };

    Scroll.prototype.checkDOMChanges = function () {
        return this.isReady()
            && ((this.wrapperW != (this.DOMelement.offsetWidth || 1))
            || (this.wrapperH != (this.DOMelement.offsetHeight || 1))
            || (this.scrollerW != Math.round(this.scroller.offsetWidth * this.scale))
            || (this.scrollerH != Math.round((this.scroller.offsetHeight - this.options.topOffset - this.options.bottomOffset) * this.scale)));
    };

    Scroll.prototype.setScale = function (scale) {
        this.scale = scale;
        if (this.scale < this.options.zoomMin) this.scale = this.options.zoomMin;
    };

    Scroll.prototype.refresh = function () {
        var wrapperOffset, i, l, els;

        this.wrapperW = this.DOMelement.offsetWidth || 1;
        this.wrapperH = this.DOMelement.offsetHeight || 1;

        this.scrollerW = Math.round(this.scroller.offsetWidth * this.scale);
        this.scrollerH = Math.round((this.scroller.offsetHeight - this.options.topOffset - this.options.bottomOffset) * this.scale);
        this.maxScrollX = this.wrapperW - this.scrollerW;
        if (this.maxScrollX > 0) this.maxScrollX = 0;
        this.maxScrollY = this.wrapperH - this.scrollerH - this.options.topOffset - this.options.bottomOffset;
        if (this.maxScrollY > 0) this.maxScrollY = 0;
        this.dirX = 0;
        this.dirY = 0;
        /*
         a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "refresh wrapper=" + this.wrapperW + "," + this.wrapperH
         + ' scroller=' + this.scrollerW + "," + this.scrollerH
         + ' maxScroll=' + this.maxScrollX + "," + this.maxScrollY);
         */
        if (this.options.onRefresh) this.options.onRefresh.call(this);

        this.hScroll = this.options.hScroll && this.maxScrollX < 0;
        this.vScroll = this.options.vScroll && ((!this.options.bounceLock && !this.hScroll) || (this.scrollerH > this.wrapperH));

        this.hScrollbar = this.hScroll && this.options.hScrollbar;
        this.vScrollbar = this.vScroll && this.options.vScrollbar && this.scrollerH > this.wrapperH;

        wrapperOffset = offset(this, this.DOMelement);
        this.wrapperOffsetLeft = wrapperOffset.left;
        this.wrapperOffsetTop = wrapperOffset.top;

        // Prepare snap
        if (this.options.pageSelector) {
            this.pagesX = [];
            this.pagesY = [];
            els = this.scroller.querySelectorAll(this.options.pageSelector);
            for (i = 0, l = els.length; i < l; i++) {
                var posLT = offset(this, els[i]);
                posLT.left -= this.wrapperOffsetLeft;
                posLT.top -= this.wrapperOffsetTop;
                this.pagesX[i] = -posLT.left < this.maxScrollX ? this.maxScrollX : -posLT.left * this.scale;
                this.pagesY[i] = -posLT.top < this.maxScrollY ? this.maxScrollY : -posLT.top * this.scale;
            }
        } else if (this.options.snap) {
            var pos = 0;
            var page = 0;
            this.pagesX = [];
            while (pos >= this.maxScrollX) {
                this.pagesX[page] = pos;
                pos = pos - this.wrapperW;
                page++;
            }
            if (this.maxScrollX % this.wrapperW) this.pagesX[this.pagesX.length] = this.maxScrollX - this.pagesX[this.pagesX.length - 1] + this.pagesX[this.pagesX.length - 1];

            pos = 0;
            page = 0;
            this.pagesY = [];
            while (pos >= this.maxScrollY) {
                this.pagesY[page] = pos;
                pos = pos - this.wrapperH;
                page++;
            }
            if (this.maxScrollY % this.wrapperH) this.pagesY[this.pagesY.length] = this.maxScrollY - this.pagesY[this.pagesY.length - 1] + this.pagesY[this.pagesY.length - 1];
        }

        // Prepare the scrollbars
        scrollbarH(this);
        scrollbarV(this);

        if (!this.zoomed) {
            this.scroller.style[miapp.BrowserCapabilities.transitionDuration] = '0';
            resetPos(this, 400);
        }
    };

    Scroll.prototype.scrollTo = function (x, y, time, relative, reset) {
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, 'scrollTo ' + x + "," + y + "," + time + "," + relative);
        this.stop();
        if (relative) {
            x = this.x - x;
            y = this.y - y;
        }
        var deltaX = x - this.x;
        var deltaY = y - this.y;
        if (deltaX || deltaY) {
            //console.log('Scroll : scrollTo() steps.push : deltaX=' + deltaX + ' deltaY=' + deltaY + ' x=' + x + ' y=' + y + ' this.x=' + this.x + ' this.y=' + this.y);
            this.steps.push({deltaX: deltaX, deltaY: deltaY, time: time || 0, reset: reset});
            startAni(this);
        }
    };

    Scroll.prototype.scrollToElement = function (el, time) {
        var pos;
        el = el.nodeType ? el : this.scroller.querySelector(el);
        if (!el) return;

        pos = offset(this, el);
        pos.left -= this.wrapperOffsetLeft;
        pos.top -= this.wrapperOffsetTop;

        pos.left = -pos.left > 0 ? 0 : -pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
        pos.top = -pos.top > -this.options.topOffset ? -this.options.topOffset : -pos.top < this.maxScrollY ? this.maxScrollY : pos.top;
        time = a4p.isUndefined(time) ? Math.max(Math.abs(pos.left) * 2, Math.abs(pos.top) * 2) : time;

        //console.log('Scroll : scrollToElement() scrollTo : x=' + -pos.left + ' y=' + -pos.top);
        this.scrollTo(-pos.left, -pos.top, time);
    };

    Scroll.prototype.scrollToPage = function (pageX, pageY, time) {
        var x, y;

        time = a4p.isUndefined(time) ? 400 : time;

        if (this.options.pageSelector) {
            pageX = pageX == 'next' ? this.currPageX + 1 : pageX == 'prev' ? this.currPageX - 1 : pageX;
            pageY = pageY == 'next' ? this.currPageY + 1 : pageY == 'prev' ? this.currPageY - 1 : pageY;

            pageX = pageX < 0 ? 0 : pageX > this.pagesX.length - 1 ? this.pagesX.length - 1 : pageX;
            pageY = pageY < 0 ? 0 : pageY > this.pagesY.length - 1 ? this.pagesY.length - 1 : pageY;

            this.currPageX = pageX;
            this.currPageY = pageY;
            x = this.pagesX[pageX];
            y = this.pagesY[pageY];
        } else {
            x = -this.wrapperW * pageX;
            y = -this.wrapperH * pageY;
            if (x < this.maxScrollX) x = this.maxScrollX;
            if (y < this.maxScrollY) y = this.maxScrollY;
        }

        //console.log('Scroll : scrollToPage() scrollTo : x=' + x + ' y=' + y);
        this.scrollTo(x, y, time);
    };

    /**
     * Indicate if scroller has attained its limits on left side
     */
    Scroll.prototype.hasAttainedSideLeft = function () {
        return !this.hScroll || (this.x >= 0);
    };
    /**
     * Indicate if scroller has attained its limits on right side
     */
    Scroll.prototype.hasAttainedSideRight = function () {
        return !this.hScroll || (this.x <= this.maxScrollX);
    };
    /**
     * Indicate if scroller has attained its limits on top side
     */
    Scroll.prototype.hasAttainedSideTop = function () {
        return !this.vScroll || (this.y >= -this.options.topOffset);
    };
    /**
     * Indicate if scroller has attained its limits on bottom side
     */
    Scroll.prototype.hasAttainedSideBottom = function () {
        return !this.vScroll || (this.y <= this.maxScrollY);
    };

    Scroll.prototype.disable = function () {
        this.stop();
        resetPos(this, 0);
        this.enabled = false;
    };

    Scroll.prototype.enable = function () {
        this.enabled = true;
    };

    Scroll.prototype.stop = function () {
        stopMomentum(this);
        stopAni(this);
        this.steps = [];
        this.moved = false;
        this.animating = false;
    };

    Scroll.prototype.zoom = function (x, y, scale, time) {
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, 'zoom ' + x + "," + y + "," + scale + "," + time);
        var relScale = scale / this.scale;

        if (!this.options.useTransform) return;

        //console.log('zoom() : this.maxScrollX=' + this.maxScrollX + ' this.maxScrollY=' + this.maxScrollY + ' this.x=' + this.x + ' this.y=' + this.y + ' this.scale=' + this.scale + ' scale=' + scale + ' relScale=' + relScale + ' x=' + x + ' y=' + y);
        this.zoomed = true;
        time = a4p.isUndefined(time) ? 200 : time;
        x = x - this.wrapperOffsetLeft - this.x;
        y = y - this.wrapperOffsetTop - this.y;
        //this.x = x - x * relScale + this.x;
        //this.y = y - y * relScale + this.y;
        this.x = this.x * relScale;
        this.y = this.y * relScale;
        //console.log('zoom() : this.x * relScale=' + this.x + ' this.y * relScale=' + this.y);

        this.setScale(scale);
        //console.log('zoom() : setScale(' + scale + ') => this.x=' + this.x + ' this.y=' + this.y);
        this.refresh();
        //console.log('zoom() : refresh() => this.maxScrollX=' + this.maxScrollX + ' this.maxScrollY=' + this.maxScrollY + ' this.x=' + this.x + ' this.y=' + this.y);

        //console.log('zoom() : this.x=' + this.x + ' this.y=' + this.y + ' this.maxScrollX=' + this.maxScrollX + ' -this.options.topOffset=' + (-this.options.topOffset) + ' this.maxScrollY=' + this.maxScrollY);
        this.x = this.x > 0 ? 0 : this.x < this.maxScrollX ? this.maxScrollX : this.x;
        this.y = this.y > -this.options.topOffset ? -this.options.topOffset : this.y < this.maxScrollY ? this.maxScrollY : this.y;
        //console.log('zoom() : limits => this.x=' + this.x + ' this.y=' + this.y);

        this.scroller.style[miapp.BrowserCapabilities.transitionDuration] = time + 'ms';
        this.scroller.style[miapp.BrowserCapabilities.transform] =
            'translate(' + this.x + 'px,' + this.y + 'px) scale(' + scale + ')' + miapp.BrowserCapabilities.translateZ;
        this.zoomed = false;
    };

    Scroll.prototype.isReady = function () {
        return !this.moved && !this.zoomed && !this.animating;
    };

    function zoomStart(self, pageX, pageY) {
        self.zoomed = false;
        self.originX = Math.abs(pageX - self.wrapperOffsetLeft) - self.x;
        self.originY = Math.abs(pageY - self.wrapperOffsetTop) - self.y;
        if (self.options.onZoomStart) {
            self.options.onZoomStart.call(self, {pageX: pageX, pageY: pageY});
        }
    }

    function scrollStart(self) {
        if (self.options.useTransition || self.options.zoom) transitionTime(self, 0);
        self.moved = false;
        self.animating = false;
        self.distX = 0;
        self.distY = 0;
        self.absDistX = 0;
        self.absDistY = 0;
        self.dirX = 0;
        self.dirY = 0;
        self.snapStartX = self.x;
        self.snapStartY = self.y;
        stopMomentum(self);
    }

    Scroll.prototype.onZoomStart = function (pageX, pageY) {
        if (!this.enabled) return false;
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "onZoomStart " + pageX + "," + pageY);
        if (this.checkDOMChanges()) {
            this.refresh();
        }
        if (this.options.zoom) {
            zoomStart(this, pageX, pageY);
            return true;
        }
        return false;
    };

    Scroll.prototype.onScrollStart = function (pageX, pageY, timeStamp) {
        if (!this.enabled) return false;
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "onScrollStart " + pageX + "," + pageY + "," + timeStamp);

        if (this.checkDOMChanges()) {
            this.refresh();
        }

        if (this.options.zoom) zoomStart(this, pageX, pageY);
        scrollStart(this);
        this.scrollCount++;
        this.scrollHistory = [{deltaX: 0, deltaY: 0, timeStamp: timeStamp}];
        this.startX = this.x;
        this.startY = this.y;
        this.pointX = pageX;
        this.pointY = pageY;
        this.startTime = timeStamp;
        return true;
    };

    function zoomMove(self, scale) {
        self.zoomed = true;
        // Slow down if outside of the boundaries
        if (scale < self.options.zoomMin) {
            scale = 0.5 * self.options.zoomMin * Math.pow(2.0, scale / self.options.zoomMin);
        } else if (scale > self.options.zoomMax) {
            scale = 2.0 * self.options.zoomMax * Math.pow(0.5, self.options.zoomMax / scale);
        }
        self.lastScale = scale / self.scale;
        var newX = self.originX - self.originX * self.lastScale + self.x;
        var newY = self.originY - self.originY * self.lastScale + self.y;
        self.scroller.style[miapp.BrowserCapabilities.transform] =
            'translate(' + newX + 'px,' + newY + 'px) scale(' + scale + ')' + miapp.BrowserCapabilities.translateZ;
        if (self.options.onZoom) {
            self.options.onZoom.call(self, {scale: scale});
        }
    }

    function scrollMove(self, deltaX, deltaY) {
        var newX = self.x + deltaX,
            newY = self.y + deltaY;

        // Slow down if outside of the boundaries
        if (!self.options.virtualLoop) {
            if (newX > 0 || newX < self.maxScrollX) {
                newX = self.options.bounce ? self.x + (deltaX / 2) : newX >= 0 || self.maxScrollX >= 0 ? 0 : self.maxScrollX;
            }
            if (newY > -self.options.topOffset || newY < self.maxScrollY) {
                newY = self.options.bounce ? self.y + (deltaY / 2) : newY >= -self.options.topOffset || self.maxScrollY >= 0 ? -self.options.topOffset : self.maxScrollY;
            }
        }
        self.distX += deltaX;
        self.distY += deltaY;
        self.absDistX = Math.abs(self.distX);
        self.absDistY = Math.abs(self.distY);
        self.moved = true;
        //console.log('Scroll : scrollMove() x=' + newX + ' y=' + newY);
        pos(self, newX, newY);
        self.dirX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        self.dirY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;
    }

    Scroll.prototype.onZoomMove = function (scale) {
        if (!this.enabled) return false;
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "onZoomMove " + scale);
        if (this.options.zoom && (scale != 1)) {
            zoomMove(this, scale);
            return true;
        }
        return false;
    };

    Scroll.prototype.onScrollMove = function (pageX, pageY, timeStamp, scale) {
        if (!this.enabled) return false;
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "onScrollMove " + pageX + "," + pageY + "," + timeStamp + "," + scale);
        var deltaX = pageX - this.pointX,
            deltaY = pageY - this.pointY;
        if (this.options.zoom && (scale != 1)) {
            zoomMove(this, scale);
            return true;// TODO : do not return to manage zoom AND scroll at the same time ?
        }
        if ((deltaX != 0) || (deltaY != 0)) {
            scrollMove(this, deltaX, deltaY);
            this.scrollCount++;
            this.scrollHistory.push({deltaX: deltaX, deltaY: deltaY, timeStamp: timeStamp});
        }
        this.pointX = pageX;
        this.pointY = pageY;
        // Memorize only last 300ms moves for momentum
        if ((timeStamp - this.startTime) > 300) {
            this.startTime = timeStamp;
            this.startX = this.x;
            this.startY = this.y;
        }
        return true;
    };

    function zoomEnd(self, scale) {
        scale = Math.max(self.options.zoomMin, scale);
        scale = Math.min(self.options.zoomMax, scale);
        self.lastScale = scale / self.scale;
        self.setScale(scale);
        self.x = self.originX - self.originX * self.lastScale + self.x;
        self.y = self.originY - self.originY * self.lastScale + self.y;
        self.scroller.style[miapp.BrowserCapabilities.transitionDuration] = '200ms';
        self.scroller.style[miapp.BrowserCapabilities.transform] =
            'translate(' + self.x + 'px,' + self.y + 'px) scale(' + self.scale + ')' + miapp.BrowserCapabilities.translateZ;
        self.zoomed = false;
        self.refresh();
        if (self.options.onZoomEnd) {
            self.options.onZoomEnd.call(self, {scale: scale});
        }
    }

    function scrollEnd(self, deltaX, deltaY, duration) {
        if (self.options.momentum > 0) {
            //if (duration < 300 && self.options.momentum) {
            //console.log('Scroll : scrollEnd() duration=' + duration);
            var momentum = momentumPos(self, deltaX, deltaY, duration, self.options.momentum);
            deltaX = momentum.deltaX;
            deltaY = momentum.deltaY;
            duration = Math.max(momentum.time, 10);
            var newPosX = self.x + deltaX;
            var newPosY = self.y + deltaY;
            if ((self.x > 0 && newPosX > 0) || (self.x < self.maxScrollX && newPosX < self.maxScrollX)) {
                deltaX = 0;
            }
            if ((self.y > -self.options.topOffset && newPosY > -self.options.topOffset) || (self.y < self.maxScrollY && newPosY < self.maxScrollY)) {
                deltaY = 0;
            }
            if (deltaX || deltaY) {
                // Do we need to snap?
                if (self.options.snap) {
                    if (Math.abs(newPosX - self.snapStartX) < self.options.snapThreshold
                        && Math.abs(newPosY - self.snapStartY) < self.options.snapThreshold) {
                        //console.log('Scroll : scrollEnd() scrollTo : x=' + self.snapStartX + ' y=' + self.snapStartY);
                        self.scrollTo(self.snapStartX, self.snapStartY, 200);
                        return;
                    }
                    var snap = snapPos(self, newPosX, newPosY);
                    newPosX = snap.x;
                    newPosY = snap.y;
                    duration = Math.max(snap.time, duration);
                } else if (self.options.pageSelector) {
                    snapPos(self, newPosX, newPosY);
                }
                newPosX = Math.round(newPosX);
                newPosY = Math.round(newPosY);
                //console.log('Scroll : scrollEnd() scrollTo : newPosX=' + newPosX + ' newPosY=' + newPosY);
                self.scrollTo(newPosX, newPosY, duration);
                return;
            }
        } else {
            // Do we need to snap?
            var newPos2X = self.x + deltaX;
            var newPos2Y = self.y + deltaY;
            if (self.options.snap) {
                if (Math.abs(newPos2X - self.snapStartX) < self.options.snapThreshold
                    && Math.abs(newPos2Y - self.snapStartY) < self.options.snapThreshold) {
                    //console.log('Scroll : scrollEnd() 2 scrollTo : x=' + self.snapStartX + ' y=' + self.snapStartY);
                    self.scrollTo(self.snapStartX, self.snapStartY, 200);
                    return;
                }
                var snap2 = snapPos(self, newPos2X, newPos2Y);
                //console.log('Scroll : scrollEnd() 2 scrollTo : newPosX=' + snap2.x + ' newPosY=' + snap2.y);
                self.scrollTo(snap2.x, snap2.y, snap2.time);
                return
            } else if (self.options.pageSelector) {
                snapPos(self, newPos2X, newPos2Y);
            }
        }
        resetPos(self, 200);
    }

    Scroll.prototype.onZoomEnd = function (scale) {
        if (!this.enabled) return false;
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "onZoomEnd " + scale);
        if (this.zoomed) {
            zoomEnd(this, scale);
            return true;
        }
        return false;
    };

    Scroll.prototype.onScrollEnd = function (pageX, pageY, timeStamp, scale) {
        if (!this.enabled) return false;
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "onScrollEnd " + pageX + "," + pageY + "," + timeStamp + "," + scale);
        //var deltaX = pageX - this.pointX,
        //    deltaY = pageY - this.pointY;
        // Cumul of all moves
        //var deltaX = this.x - this.startX,
        //    deltaY = this.y - this.startY,
        //    duration = timeStamp - this.startTime;

        if (this.zoomed) {
            zoomEnd(this, scale);
            return true;
        }
        if (!this.moved) {
            resetPos(this, 400);
            return true;
        }

        var i = this.scrollHistory.length - 1;
        var lastMove = this.scrollHistory[i];
        var deltaX = lastMove.deltaX;
        var deltaY = lastMove.deltaY;
        var duration = 35;
        for (i--; i >= 0; i--) {
            var move = this.scrollHistory[i];
            if ((lastMove.timeStamp - move.timeStamp) < 300) {
                deltaX += move.deltaX;
                deltaY += move.deltaY;
                if ((lastMove.timeStamp - move.timeStamp) >= duration) {
                    duration = lastMove.timeStamp - move.timeStamp;
                }
            } else {
                break;
            }
        }
        this.scrollCount = 0;
        this.scrollHistory = [];
        scrollEnd(this, deltaX, deltaY, duration);
        return true;
    };

    // Ex of scroll :
    // 15:28:05.991 onScrollStart 1241,284,1380547685990
    // 15:28:05.993 onScrollMove 1241,284,1380547685990,1
    // 15:28:06.027 onScrollMove 1239,268,1380547686026,1
    // 15:28:06.044 onScrollMove 1239,258,1380547686044,1
    // 15:28:06.063 onScrollMove 1239,247,1380547686062,1
    // 15:28:06.083 onScrollMove 1238,235,1380547686083,1
    // 15:28:06.104 nScrollMove 1238,220,1380547686104,1
    // 15:28:06.124 onScrollMove 1237,205,1380547686124,1
    // 15:28:06.153 onScrollMove 1236,184,1380547686153,1
    // 15:28:06.186 onScrollMove 1236,163,1380547686186,1
    // 15:28:06.208 onScrollMove 1236,152,1380547686208,1
    // 15:28:06.237 onScrollMove 1235,143,1380547686237,1
    // 15:28:06.246 onScrollEnd 1235,143,1380547686246,1

    // Ex of wheel :
    // 15:28:07.650 wheel 0,-120
    // 15:28:07.672 wheel 0,-120
    // 15:28:07.692 wheel 0,-120
    // 15:28:07.722 wheel 0,-360
    // 15:28:07.754 wheel 0,-360
    // 15:28:07.790 wheel 0,-120

    Scroll.prototype.wheel = function (e, cumulatedWheelDeltaX, cumulatedWheelDeltaY) {
        //a4p.InternalLog.log('a4p.Scroll ' + this.options.name, "wheel " + e.wheelDeltaX + "," + e.wheelDeltaY);
        // By default we consider 30 fps (== 33 ms) for the first wheel, and then we take Math.min(33, delayBetween2Wheels)
        var timeStamp = e.timeStamp;
        var deltaX = 0, deltaY = 0;

        if ((a4p.isDefined(cumulatedWheelDeltaX) && (cumulatedWheelDeltaX != 0)) || (a4p.isDefined(cumulatedWheelDeltaY) && (cumulatedWheelDeltaY != 0))) {
            deltaX = cumulatedWheelDeltaX / 12;
            deltaY = cumulatedWheelDeltaY / 12;
        } else if (('wheelDeltaX' in e) && ((e.wheelDeltaX != 0) || (e.wheelDeltaY != 0))) {
            deltaX = e.wheelDeltaX / 12;
            deltaY = e.wheelDeltaY / 12;
        } else if (('wheelDelta' in e) && (e.wheelDelta != 0)) {
            deltaX = deltaY = e.wheelDelta / 12;
        } else if (('detail' in e) && (e.detail != 0)) {
            deltaX = deltaY = -e.detail * 3;
        }
        if ((deltaX == 0) && (deltaY == 0)) {
            return false;
        }

        if (this.checkDOMChanges()) {
            this.refresh();
        }

        var self = this;
        if (this.options.wheelAction == 'zoom') {
            var deltaScale = this.scale * Math.pow(2, 1 / 3 * (deltaY ? deltaY / Math.abs(deltaY) : 0));
            if (deltaScale < this.options.zoomMin) deltaScale = this.options.zoomMin;
            if (deltaScale > this.options.zoomMax) deltaScale = this.options.zoomMax;

            if (deltaScale != this.scale) {
                if (!this.wheelZoomCount && this.options.onZoomStart) {
                    this.options.onZoomStart.call(this, e);
                }
                this.wheelZoomCount++;

                this.zoom(e.pageX, e.pageY, deltaScale, 400);
                window.setTimeout(function () {
                    self.wheelZoomCount--;
                    if (!self.wheelZoomCount && self.options.onZoomEnd) {
                        self.options.onZoomEnd.call(self, e);
                    }
                }, 400);
            }

            return true;
        }

        if (this.scrollCount == 0) {
            scrollStart(this);
            this.scrollCount++;
            this.scrollHistory = [{deltaX: 0, deltaY: 0, timeStamp: timeStamp}];
        }
        scrollMove(this, deltaX, deltaY);
        this.scrollCount++;
        this.scrollHistory.push({deltaX: deltaX, deltaY: deltaY, timeStamp: timeStamp});
        //this.wheelTimer = window.setTimeout(function () {...}
        window.setTimeout(function () {
            //self.wheelTimer = null;
            self.scrollCount--;
            if (self.scrollCount == 1) {
                var i = self.scrollHistory.length - 1;
                var lastMove = self.scrollHistory[i];
                var deltaX = lastMove.deltaX;
                var deltaY = lastMove.deltaY;
                var duration = 35;
                for (i--; i >= 0; i--) {
                    var move = self.scrollHistory[i];
                    if ((lastMove.timeStamp - move.timeStamp) < 300) {
                        deltaX += move.deltaX;
                        deltaY += move.deltaY;
                        if ((lastMove.timeStamp - move.timeStamp) >= duration) {
                            duration = lastMove.timeStamp - move.timeStamp;
                        }
                    } else {
                        break;
                    }
                }
                self.scrollCount = 0;
                self.scrollHistory = [];
                scrollEnd(self, deltaX, deltaY, duration);
            }
        }, 35);
        /*
         if (this.wheelTimer) {
         clearTimeout(this.wheelTimer);
         this.wheelTimer = null;
         }
         */
        return true;
        /*
         newX = this.x + deltaX;
         newY = this.y + deltaY;
         if (((newX != this.x) || (newY != this.y)) && (this.maxScrollY < 0)) {
         if (newX > 0) newX = 0;
         else if (newX < this.maxScrollX) newX = this.maxScrollX;
         if (newY > -this.options.topOffset) newY = -this.options.topOffset;
         else if (newY < this.maxScrollY) newY = this.maxScrollY;
         this.scrollTo(newX, newY, 0);
         return true;
         }
         return false;
         */
    };

    return Scroll;
})(navigator, window, document);

/**
 * Simultaneous management of many Mouse/Touch/Timer events in one DOM element
 */
a4p.Sense = (function (navigator, window, document) {

    var dndables = [];
    var dndablesMap = {};
    var droppables = [];
    var droppablesMap = {};

    // A consistent way to create a unique ID which will never overflow.

    var uid = ['0', '0', '0'];
    var idStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var idNext = {
        '0': 1, '1': 2, '2': 3, '3': 4, '4': 5, '5': 6, '6': 7, '7': 8, '8': 9, '9': 10,
        'A': 11, 'B': 12, 'C': 13, 'D': 14, 'E': 15, 'F': 16, 'G': 17, 'H': 18, 'I': 19, 'J': 20,
        'K': 21, 'L': 22, 'M': 23, 'N': 24, 'O': 25, 'P': 26, 'Q': 27, 'R': 28, 'S': 29, 'T': 30,
        'U': 31, 'V': 32, 'W': 33, 'X': 34, 'Y': 35, 'Z': 0
    };

    function nextUid() {
        var index = uid.length;
        while (index) {
            index--;
            var i = idNext[uid[index]];
            uid[index] = idStr[i];
            if (i > 0) {
                return uid.join('');
            }
        }
        uid.unshift('0');
        return uid.join('');
    }

    // Binding utilities

    function handleTouchStart(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleTouchStart');
        sense.timeStamp = (new Date()).getTime();
        sense.inTouchMove = false;
        sense.evtHandled = false;
        sense.evtTriggered = false;
        if (sense.fingers.length <= 0) {
            bindOnTouchOther(sense);
        }
        onTouchStart[sense.state].call(sense, evt);
        if (sense.evtTriggered) {
            if (!sense.options.defaultAction) preventDefault(evt);
            if (!sense.options.bubble) stopPropagation(evt);
        }
        return !sense.options.defaultAction;
    }

    function handleTouchMove(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleTouchMove');
        // ignore multiple move events in 1 frame (at 60 fps this gives 17 ms)
        var now = (new Date()).getTime();
        if ((now - sense.timeStamp) < 17) {
            return true;
        }
        sense.timeStamp = now;
        if (!sense.inTouchMove) {
            sense.inTouchMove = true;
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleTouchMove');
        }
        sense.evtHandled = false;
        sense.evtTriggered = false;
        // Beware : target is DOM element upon which button was down
        onTouchMove[sense.state].call(sense, evt);
        if (sense.evtTriggered) {
            if (!sense.options.defaultAction) preventDefault(evt);
            if (!sense.options.bubble) stopPropagation(evt);
            unbindAllOtherExceptFor(sense)
        }
        return !sense.options.defaultAction;
    }

    function handleTouchEnd(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleTouchEnd');
        sense.timeStamp = (new Date()).getTime();
        sense.inTouchMove = false;
        sense.evtHandled = false;
        sense.evtTriggered = false;
        // Beware : target is DOM element upon which button was down
        onTouchEnd[sense.state].call(sense, evt);
        if (sense.evtTriggered) {
            if (!sense.options.defaultAction) preventDefault(evt);
            if (!sense.options.bubble) stopPropagation(evt);
            unbindAllOtherExceptFor(sense)
        }
        if (sense.fingers.length <= 0) {
            unbindOther(sense);
        }
        return !sense.options.defaultAction;
    }

    function handleTouchCancel(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleTouchCancel');
        sense.timeStamp = (new Date()).getTime();
        sense.inTouchMove = false;
        sense.evtHandled = false;
        sense.evtTriggered = false;
        // Beware : target is DOM element upon which button was down
        onTouchCancel[sense.state].call(sense, evt);
        if (sense.evtTriggered) {
            if (!sense.options.defaultAction) preventDefault(evt);
            if (!sense.options.bubble) stopPropagation(evt);
            unbindAllOtherExceptFor(sense)
        }
        if (sense.fingers.length <= 0) {
            unbindOther(sense);
        }
        return !sense.options.defaultAction;
    }

    function handleMouseDown(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleMouseDown');
        sense.timeStamp = (new Date()).getTime();
        sense.inMouseMove = false;
        sense.evtHandled = false;
        sense.evtTriggered = false;
        if (sense.fingers.length <= 0) {
            bindOnMouseOther(sense);
        }
        onMouseDown[sense.state].call(sense, evt);
        if (sense.evtTriggered) {
            if (!sense.options.defaultAction) preventDefault(evt);
            if (!sense.options.bubble) stopPropagation(evt);
        }
        return !sense.options.defaultAction;
    }

    function handleMouseMove(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleMouseMove');
        // ignore multiple move events in 1 frame (at 60 fps this gives 17 ms)
        var now = (new Date()).getTime();
        if ((now - sense.timeStamp) < 17) {
            return true;
        }
        sense.timeStamp = now;
        if (!sense.inMouseMove) {
            sense.inMouseMove = true;
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleMouseMove');
        }
        sense.evtHandled = false;
        sense.evtTriggered = false;
        // Beware : target is DOM element upon which button is moved
        onMouseMove[sense.state].call(sense, evt);
        if (sense.evtTriggered) {
            if (!sense.options.defaultAction) preventDefault(evt);
            if (!sense.options.bubble) stopPropagation(evt);
            unbindAllOtherExceptFor(sense)
        }
        return !sense.options.defaultAction;
    }

    function handleMouseUp(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleMouseUp');
        sense.timeStamp = (new Date()).getTime();
        sense.inMouseMove = false;
        sense.evtHandled = false;
        sense.evtTriggered = false;
        // Beware : target is DOM element upon which button is released
        onMouseUp[sense.state].call(sense, evt);
        if (sense.evtTriggered) {
            if (!sense.options.defaultAction) preventDefault(evt);
            if (!sense.options.bubble) stopPropagation(evt);
            unbindAllOtherExceptFor(sense)
        }
        if (sense.fingers.length <= 0) {
            unbindOther(sense);
        }
        return !sense.options.defaultAction;
    }

    function handleWheel(sense, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleWheel');
        // Cumulate previously ignored wheel events
        // TODO : take into account use case of attributes deltaMode,deltaX,deltaY,deltaZ
        if (('wheelDeltaX' in evt) && ((evt.wheelDeltaX != 0) || (evt.wheelDeltaY != 0))) {
            sense.wheelDeltaX += evt.wheelDeltaX;
            sense.wheelDeltaY += evt.wheelDeltaY;
        } else if (('wheelDelta' in evt) && (evt.wheelDelta != 0)) {
            sense.wheelDeltaX += evt.wheelDelta;
            sense.wheelDeltaY += evt.wheelDelta;
        } else if (('detail' in evt) && (evt.detail != 0)) {
            sense.wheelDeltaX += -evt.detail * 36;
            sense.wheelDeltaY += -evt.detail * 36;
        }

        // ignore multiple move events in 1 frame (at 60 fps this gives 17 ms)
        var now = (new Date()).getTime();
        if ((now - sense.timeStamp) < 17) {
            return !sense.options.defaultAction;
        }
        // Reinjecting cumulated deltas into current event is IMPOSSIBLE (read-only attributes)
        /*
         if ('wheelDeltaX' in evt) {
         evt.wheelDeltaX = sense.wheelDeltaX;
         evt.wheelDeltaY = sense.wheelDeltaY;
         }
         if ('wheelDelta' in evt) {
         evt.wheelDelta = (sense.wheelDeltaY != 0) ? sense.wheelDeltaY : sense.wheelDeltaX;
         }
         if ('detail' in evt) {
         evt.detail = Math.floor((sense.wheelDeltaY != 0) ? -sense.wheelDeltaY : -sense.wheelDeltaX)/36;
         }
         */
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'handleWheel');
        if (sense.scroll) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.wheel');
            sense.scroll.wheel(evt, sense.wheelDeltaX, sense.wheelDeltaY);
        }
        // Reset cumulator
        sense.wheelDeltaX = 0;
        sense.wheelDeltaY = 0;
        sense.timeStamp = now;
        return !sense.options.defaultAction;
    }

    var mouseListeners = [];
    var touchListeners = [];
    var timeStampDocMouseMove = 0;

    function handleDocMouseMove(evt) {
        //a4p.InternalLog.log('a4p.Sense', 'handleDocMouseMove');
        // ignore multiple move events in 1 frame (at 60 fps this gives 17 ms)
        var now = (new Date()).getTime();
        if ((now - timeStampDocMouseMove) < 17) {
            return true;
        }
        timeStampDocMouseMove = now;
        // mouseListeners array can be modified during call of handlers => we make a copy
        var i, nb, handlers = [];
        for (i = 0, nb = mouseListeners.length; i < nb; i++) {
            handlers.push(mouseListeners[i]);
        }
        var noBubble = false;
        for (i = 0, nb = handlers.length; i < nb; i++) {
            if (a4p.isDefined(handlers[i])) {
                handleMouseMove(handlers[i], evt);
                noBubble = handlers[i].evtTriggered && !handlers[i].options.bubble;
            }
            if (noBubble) break;
        }
        return true;
    }

    function handleDocMouseUp(evt) {
        //a4p.InternalLog.log('a4p.Sense', 'handleDocMouseUp');
        // mouseListeners array can be modified during call of handlers => we make a copy
        var i, nb, handlers = [];
        for (i = 0, nb = mouseListeners.length; i < nb; i++) {
            handlers.push(mouseListeners[i]);
        }
        var noBubble = false;
        for (i = 0, nb = handlers.length; i < nb; i++) {
            if (a4p.isDefined(handlers[i])) {
                handleMouseUp(handlers[i], evt);
                noBubble = handlers[i].evtTriggered && !handlers[i].options.bubble;
            }
            if (noBubble) break;
        }
        return true;
    }

    document.addEventListener('mousemove', handleDocMouseMove, false);
    document.addEventListener('mouseup', handleDocMouseUp, false);

    function bindOnStart(sense, newScroll) {
        if (miapp.BrowserCapabilities.hasTouch) {
            if (!sense.bindTouchStart) {
                sense.bindTouchStart = bindEvent(sense.DOMelement, 'touchstart', function (evt) {
                    handleTouchStart(sense, evt);
                });
                //sense.bindTouchStart = angularBindEvent(sense.element, 'touchstart', function(evt) {handleTouchStart(sense, evt);});
                //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'bind OnTouchStart');
            }
        } else {
            // In Chrome, useTouch = true BUT we receive only mouse events
            if (!sense.bindMouseDown) {
                sense.bindMouseDown = bindEvent(sense.DOMelement, 'mousedown', function (evt) {
                    handleMouseDown(sense, evt);
                });
                //sense.bindMouseDown = angularBindEvent(sense.element, 'mousedown', function(evt) {handleMouseDown(sense, evt);});
                //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'bind OnMouseStart');
            }
            if (newScroll) {
                if (!sense.bindMouseWheel) {
                    sense.bindMouseWheel = bindEvent(sense.DOMelement, 'mousewheel', function (evt) {
                        handleWheel(sense, evt);
                    });
                }
                if (!sense.bindDomMouseWheel) {
                    sense.bindDomMouseWheel = bindEvent(sense.DOMelement, 'DOMMouseScroll', function (evt) {
                        handleWheel(sense, evt);
                    });
                }
            }
        }
    }

    function unbindStart(sense) {
        if (sense.bindDomMouseWheel) {
            sense.bindDomMouseWheel.destroy();
            sense.bindDomMouseWheel = false;
        }
        if (sense.bindMouseWheel) {
            sense.bindMouseWheel.destroy();
            sense.bindMouseWheel = false;
        }
        if (miapp.BrowserCapabilities.hasTouch) {
            if (sense.bindTouchStart) {
                sense.bindTouchStart.destroy();
                sense.bindTouchStart = false;
            }
        } else {
            if (sense.bindMouseDown) {
                sense.bindMouseDown.destroy();
                sense.bindMouseDown = false;
            }
        }
    }

    function bindOnTouchOther(sense) {
        if (miapp.BrowserCapabilities.hasTouch && sense.bindTouchStart) {
            var found = false;
            for (var i = touchListeners.length - 1; i >= 0; i--) {
                if (touchListeners[i].id == sense.id) {
                    found = true;
                    break;
                }
            }
            if (!found) touchListeners.push(sense);
            if (!sense.bindTouchMove) {
                sense.bindTouchMove = bindEvent(sense.DOMelement, 'touchmove', function (evt) {
                    handleTouchMove(sense, evt);
                });
                //sense.bindTouchMove = angularBindEvent(sense.element, 'touchmove', function(evt) {handleTouchMove(sense, evt);});
            }
            if (!sense.bindTouchEnd) {
                sense.bindTouchEnd = bindEvent(sense.DOMelement, 'touchend', function (evt) {
                    handleTouchEnd(sense, evt);
                });
                //sense.bindTouchEnd = angularBindEvent(sense.element, 'touchend', function(evt) {handleTouchEnd(sense, evt);});
            }
            if (!sense.bindTouchCancel) {
                sense.bindTouchCancel = bindEvent(sense.DOMelement, 'touchcancel', function (evt) {

                    //evt.preventDefault();
                    handleTouchCancel(sense, evt);
                });
                //sense.bindTouchCancel = angularBindEvent(sense.element, 'touchcancel', function(evt) {handleTouchCancel(sense, evt);});
            }
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'bind OnTouchOther');
        }
    }

    function bindOnMouseOther(sense) {
        if (!miapp.BrowserCapabilities.hasTouch && sense.bindMouseDown && !sense.bindMouseOther) {
            var found = false;
            for (var i = mouseListeners.length - 1; i >= 0; i--) {
                if (mouseListeners[i].id == sense.id) {
                    found = true;
                    break;
                }
            }
            if (!found) mouseListeners.push(sense);
            /*
             if (!sense.bindMouseMove) {
             sense.bindMouseMove = angularBindEvent(sense.element, 'mousemove', function(evt) {handleMouseMove(sense, evt);});
             }
             if (!sense.bindMouseUp) {
             sense.bindMouseUp = angularBindEvent(sense.element, 'mouseup', function(evt) {handleMouseUp(sense, evt);});
             }
             */
            // Unbindings create in browser a lot of bad performances
            sense.bindMouseOther = true;
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'bind OnMouseOther');
        }
    }

    function unbindAllOtherExceptFor(sense) {
        var i;
        if (miapp.BrowserCapabilities.hasTouch) {
            for (i = touchListeners.length - 1; i >= 0; i--) {
                if (touchListeners[i].id != sense.id) {
                    touchListeners[i].resetState();
                } else {
                    // Skip below senses
                    break;
                }
            }
        } else {
            for (i = mouseListeners.length - 1; i >= 0; i--) {
                if (mouseListeners[i].id != sense.id) {
                    mouseListeners[i].resetState();
                } else {
                    // Skip below senses
                    break;
                }
            }
        }
    }

    function unbindOther(sense) {
        var i;
        if (miapp.BrowserCapabilities.hasTouch) {
            for (i = touchListeners.length - 1; i >= 0; i--) {
                if (touchListeners[i].id == sense.id) {
                    touchListeners.splice(i, 1);
                    break;
                }
            }
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'unbindOther');
            if (sense.bindTouchMove) {
                sense.bindTouchMove.destroy();
                sense.bindTouchMove = false;
            }
            if (sense.bindTouchEnd) {
                sense.bindTouchEnd.destroy();
                sense.bindTouchEnd = false;
            }
            if (sense.bindTouchCancel) {
                sense.bindTouchCancel.destroy();
                sense.bindTouchCancel = false;
            }
        } else {
            if (sense.bindMouseOther) {
                for (i = mouseListeners.length - 1; i >= 0; i--) {
                    if (mouseListeners[i].id == sense.id) {
                        mouseListeners.splice(i, 1);
                        break;
                    }
                }
                //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'unbindOther');
                /*
                 if (sense.bindMouseMove) {
                 sense.bindMouseMove.destroy();
                 sense.bindMouseMove = false;
                 }
                 if (sense.bindMouseUp) {
                 sense.bindMouseUp.destroy();
                 sense.bindMouseUp = false;
                 }
                 */
                // Unbindings create in browser a lot of bad performances
                sense.bindMouseOther = false;
            }
        }
    }

    /*
     function angularBindEvent(element, eventName, callback) {
     element.bind(eventName, callback, false);// go directly into JQLite
     //angular.element(element[0]).bind(eventName, callback, false);// Go through angular.scenario.js (enable e2e tests)
     return {
     destroy: function() {
     element.unbind(eventName, callback, false);// go directly into JQLite
     //angular.element(element[0]).unbind(eventName, callback, false);// Go through angular.scenario.js (enable e2e tests)
     }
     };
     }
     */

    function bindEvent(element, eventName, callback) {
        // bind directly into browser (no passthrough angular nor JQLite)
        //if (element.bind) {
        //    element.bind(eventName, callback, false);
        //} else
        if (element.addEventListener) {
            element.addEventListener(eventName, callback, false);
            return {
                destroy: function () {
                    element.removeEventListener(eventName, callback, false);
                }
            };
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventName, callback);
            return {
                destroy: function () {
                    element.detachEvent('on' + eventName, callback);
                }
            };
        } else {
            return false;
        }
    }

    function preventDefault(event) {
        event = event || window.event;
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }

    function stopPropagation(event) {
        event = event || window.event;
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    }

    function eventNameWithoutPrefixNorNbFinger(eventName) {
        if (eventName.substr(0, 5) == 'Short') {
            eventName = eventName.substr(5);
        } else if (eventName.substr(0, 4) == 'Long') {
            eventName = eventName.substr(4);
        }
        var lg = eventName.length;
        if ((lg > 0) && ((eventName.charAt(lg - 1) == '1')
            || (eventName.charAt(lg - 1) == '2')
            || (eventName.charAt(lg - 1) == '3')
            || (eventName.charAt(lg - 1) == '4')
            || (eventName.charAt(lg - 1) == '5'))) {
            return eventName.substr(0, lg - 1);
        }
        return eventName;
    }

    // Finger utilities

    function clearFingers(sense) {
        sense.fingers = [];
        sense.side = '';
        sense.scale = 1.0;
        sense.rotate = 0.0;
        sense.moves = [];
        sense.timeStamp = (new Date()).getTime();
        sense.wheelDeltaX = 0;
        sense.wheelDeltaY = 0;
        sense.sourcePoints = [];// First finger clientX and clientY coords

        // Start gesture position of the first finger touch
        sense.startPageX = 0;
        sense.startPageY = 0;
        sense.startClientX = 0;
        sense.startClientY = 0;
        // Current position of the first finger
        sense.pageX = 0;
        sense.pageY = 0;
        sense.clientX = 0;
        sense.clientY = 0;
        // Current relative position of first finger vs its last significant position (
        sense.deltaX = 0;
        sense.deltaY = 0;
        // Current relative position of second finger vs first finger
        sense.deltaFingerX = 0;
        sense.deltaFingerY = 0;

        delete sense.finger1;
        delete sense.finger2;
    }

    function addTouchFinger(sense, id, finger) {
        // finger.clientX: X coordinate of touch relative to the viewport (excludes scroll offset)
        // finger.clientY: Y coordinate of touch relative to the viewport (excludes scroll offset)
        // finger.screenX: Relative to the screen
        // finger.screenY: Relative to the screen
        // finger.pageX: Relative to the full page (includes scrolling)
        // finger.pageY: Relative to the full page (includes scrolling)
        // finger.identifier: An identifying number, unique to each touch point (finger) currently active on the screen
        // finger.target: The DOM node that the finger is touching
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id) {
                // SET instead of ADD (this case appears with Browser debugger : end event does not come)
                if (i > 1) {
                    // Third+ finger => unused
                    sense.fingers[i] = {
                        id: id,
                        target: finger.target,
                        pageX: finger.pageX,
                        pageY: finger.pageY,
                        clientX: finger.clientX,
                        clientY: finger.clientY,
                        deltaFingerX: finger.clientX - sense.clientX,
                        deltaFingerY: finger.clientY - sense.clientY
                    };
                } else if (i == 1) {
                    // Second finger => needed for scale/rotate
                    sense.deltaFingerX = finger.clientX - sense.clientX;
                    sense.deltaFingerY = finger.clientY - sense.clientY;

                    sense.fingers[1] = {
                        id: id,
                        target: finger.target,
                        pageX: finger.pageX,
                        pageY: finger.pageY,
                        clientX: finger.clientX,
                        clientY: finger.clientY,
                        deltaFingerX: sense.deltaFingerX,
                        deltaFingerY: sense.deltaFingerY
                    };

                    sense.finger2 = sense.fingers[1];
                } else {
                    // First finger => reference for all
                    sense.startPageX = finger.pageX;
                    sense.startPageY = finger.pageY;
                    sense.startClientX = finger.clientX;
                    sense.startClientY = finger.clientY;
                    sense.pageX = finger.pageX;
                    sense.pageY = finger.pageY;
                    sense.clientX = finger.clientX;
                    sense.clientY = finger.clientY;
                    sense.deltaFingerX = 0;
                    sense.deltaFingerY = 0;

                    sense.fingers[0] = {
                        id: id,
                        target: finger.target,
                        pageX: finger.pageX,
                        pageY: finger.pageY,
                        clientX: finger.clientX,
                        clientY: finger.clientY,
                        deltaFingerX: 0,
                        deltaFingerY: 0
                    };

                    sense.finger1 = sense.fingers[0];
                }
                return;
            }
        }
        // ADD
        if (sense.fingers.length > 1) {
            // Third+ finger => unused
            sense.fingers.push({
                id: id,
                target: finger.target,
                pageX: finger.pageX,
                pageY: finger.pageY,
                clientX: finger.clientX,
                clientY: finger.clientY,
                deltaFingerX: finger.clientX - sense.clientX,
                deltaFingerY: finger.clientY - sense.clientY
            });
        } else if (sense.fingers.length == 1) {
            // Second finger => needed for scale/rotate
            sense.deltaFingerX = finger.clientX - sense.clientX;
            sense.deltaFingerY = finger.clientY - sense.clientY;

            sense.fingers.push({
                id: id,
                target: finger.target,
                pageX: finger.pageX,
                pageY: finger.pageY,
                clientX: finger.clientX,
                clientY: finger.clientY,
                deltaFingerX: sense.deltaFingerX,
                deltaFingerY: sense.deltaFingerY
            });

            sense.finger2 = sense.fingers[1];
        } else {
            // First finger => reference for all
            sense.startPageX = finger.pageX;
            sense.startPageY = finger.pageY;
            sense.startClientX = finger.clientX;
            sense.startClientY = finger.clientY;
            sense.pageX = finger.pageX;
            sense.pageY = finger.pageY;
            sense.clientX = finger.clientX;
            sense.clientY = finger.clientY;
            sense.deltaFingerX = 0;
            sense.deltaFingerY = 0;

            sense.fingers.push({
                id: id,
                target: finger.target,
                pageX: finger.pageX,
                pageY: finger.pageY,
                clientX: finger.clientX,
                clientY: finger.clientY,
                deltaFingerX: 0,
                deltaFingerY: 0
            });

            sense.finger1 = sense.fingers[0];
        }
    }

    function addMouseFinger(sense, id, evt) {
        var pageX = getMousePageX(evt);
        var pageY = getMousePageY(evt);
        // Beware : touch.target is the start target (while a mouse.target is the move target)
        // => to have same behaviour we set target on start.target even for mouse event
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id) {
                // SET instead of ADD (this case appears with Browser debugger : end event does not come)
                if (i > 1) {
                    // Third+ finger => unused
                    sense.fingers[i] = {
                        id: id,
                        target: evt.target,
                        pageX: pageX,
                        pageY: pageY,
                        clientX: evt.clientX,
                        clientY: evt.clientY,
                        deltaFingerX: evt.clientX - sense.clientX,
                        deltaFingerY: evt.clientY - sense.clientY
                    };
                } else if (i == 1) {
                    // Second finger => needed for scale/rotate
                    sense.deltaFingerX = evt.clientX - sense.clientX;
                    sense.deltaFingerY = evt.clientY - sense.clientY;

                    sense.fingers[1] = {
                        id: id,
                        target: evt.target,
                        pageX: pageX,
                        pageY: pageY,
                        clientX: evt.clientX,
                        clientY: evt.clientY,
                        deltaFingerX: sense.deltaFingerX,
                        deltaFingerY: sense.deltaFingerY
                    };

                    sense.finger2 = sense.fingers[1];
                } else {
                    // First finger => reference for all
                    sense.startPageX = pageX;
                    sense.startPageY = pageY;
                    sense.startClientX = evt.clientX;
                    sense.startClientY = evt.clientY;
                    sense.pageX = pageX;
                    sense.pageY = pageY;
                    sense.clientX = evt.clientX;
                    sense.clientY = evt.clientY;
                    sense.deltaFingerX = 0;
                    sense.deltaFingerY = 0;

                    sense.fingers[0] = {
                        id: id,
                        target: evt.target,
                        pageX: pageX,
                        pageY: pageY,
                        clientX: evt.clientX,
                        clientY: evt.clientY,
                        deltaFingerX: 0,
                        deltaFingerY: 0
                    };

                    sense.finger1 = sense.fingers[0];
                }
                return;
            }
        }
        // ADD
        if (sense.fingers.length > 1) {
            // Third+ finger => unused
            sense.fingers.push({
                id: id,
                target: evt.target,
                pageX: pageX,
                pageY: pageY,
                clientX: evt.clientX,
                clientY: evt.clientY,
                deltaFingerX: evt.clientX - sense.clientX,
                deltaFingerY: evt.clientY - sense.clientY
            });
        } else if (sense.fingers.length == 1) {
            // Second finger => needed for scale/rotate
            sense.deltaFingerX = evt.clientX - sense.clientX;
            sense.deltaFingerY = evt.clientY - sense.clientY;

            sense.fingers.push({
                id: id,
                target: evt.target,
                pageX: pageX,
                pageY: pageY,
                clientX: evt.clientX,
                clientY: evt.clientY,
                deltaFingerX: sense.deltaFingerX,
                deltaFingerY: sense.deltaFingerY
            });

            sense.finger2 = sense.fingers[1];
        } else {
            // First finger => reference for all
            sense.startPageX = pageX;
            sense.startPageY = pageY;
            sense.startClientX = evt.clientX;
            sense.startClientY = evt.clientY;
            sense.pageX = pageX;
            sense.pageY = pageY;
            sense.clientX = evt.clientX;
            sense.clientY = evt.clientY;
            sense.deltaFingerX = 0;
            sense.deltaFingerY = 0;

            sense.fingers.push({
                id: id,
                target: evt.target,
                pageX: pageX,
                pageY: pageY,
                clientX: evt.clientX,
                clientY: evt.clientY,
                deltaFingerX: 0,
                deltaFingerY: 0
            });

            sense.finger1 = sense.fingers[0];
        }
    }

    function setTouchFinger(sense, id, finger) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id) {
                item.pageX = finger.pageX;
                item.pageY = finger.pageY;
                item.clientX = finger.clientX;
                item.clientY = finger.clientY;
                if (i == 0) {
                    sense.pageX = item.pageX - item.deltaFingerX;
                    sense.pageY = item.pageY - item.deltaFingerY;
                    sense.clientX = item.clientX - item.deltaFingerX;
                    sense.clientY = item.clientY - item.deltaFingerY;
                    if (sense.fingers.length > 1) {
                        sense.deltaFingerX = sense.finger2.clientX - sense.clientX;
                        sense.deltaFingerY = sense.finger2.clientY - sense.clientY;
                    }
                } else if (i == 1) {
                    sense.deltaFingerX = item.clientX - sense.clientX;
                    sense.deltaFingerY = item.clientY - sense.clientY;
                }
                return true;
            }
        }
        return false;
    }

    function setMouseFinger(sense, id, evt) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id) {
                item.pageX = getMousePageX(evt);
                item.pageY = getMousePageY(evt);
                item.clientX = evt.clientX;
                item.clientY = evt.clientY;
                if (i == 0) {
                    sense.pageX = item.pageX - item.deltaFingerX;
                    sense.pageY = item.pageY - item.deltaFingerY;
                    sense.clientX = item.clientX - item.deltaFingerX;
                    sense.clientY = item.clientY - item.deltaFingerY;
                    if (sense.fingers.length > 1) {
                        sense.deltaFingerX = sense.finger2.clientX - sense.clientX;
                        sense.deltaFingerY = sense.finger2.clientY - sense.clientY;
                    }
                } else if (i == 1) {
                    sense.deltaFingerX = item.clientX - sense.clientX;
                    sense.deltaFingerY = item.clientY - sense.clientY;
                }
                return true;
            }
        }
        return false;
    }

    function removeFinger(sense, id) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id) {
                sense.fingers.splice(i, 1);
                if (i == 0) {
                    if (sense.fingers.length > 0) {
                        // TODO : sense.start* are still referencing the old first finger
                        sense.finger1 = sense.fingers[0];
                        sense.pageX = sense.finger1.pageX - sense.finger1.deltaFingerX;
                        sense.pageY = sense.finger1.pageY - sense.finger1.deltaFingerY;
                        sense.clientX = sense.finger1.clientX - sense.finger1.deltaFingerX;
                        sense.clientY = sense.finger1.clientY - sense.finger1.deltaFingerY;
                        if (sense.fingers.length > 1) {
                            sense.finger2 = sense.fingers[1];
                            sense.deltaFingerX = sense.finger2.clientX - sense.clientX;
                            sense.deltaFingerY = sense.finger2.clientY - sense.clientY;
                        } else {
                            // Keep sense.finger2 pointing on older finger
                        }
                    } else {
                        // Keep sense.finger1 pointing on older finger
                    }
                } else if (i == 1) {
                    if (sense.fingers.length > 1) {
                        sense.finger2 = sense.fingers[1];
                        sense.deltaFingerX = sense.finger2.clientX - sense.clientX;
                        sense.deltaFingerY = sense.finger2.clientY - sense.clientY;
                    } else {
                        // Keep sense.finger2 pointing on older finger
                    }
                }

                return true;
            }
        }
        return false;
    }

    function hasFinger(sense, id) {
        for (var i = sense.fingers.length - 1; i >= 0; i--) {
            var item = sense.fingers[i];
            if (item.id == id) {
                return true;
            }
        }
        return false;
    }

    function addSourcePoint(sense) {
        sense.sourcePoints.push({x: sense.clientX, y: sense.clientY, t: (new Date()).getTime()});
    }

    function add1FingerMove(sense) {
        if (sense.fingers.length <= 0) return false;

        var fromX = sense.startClientX;
        var fromY = sense.startClientY;
        if (sense.moves.length > 0) {
            fromX = sense.moves[sense.moves.length - 1].x;
            fromY = sense.moves[sense.moves.length - 1].y;
        }
        var deltaX = sense.clientX - fromX;
        var deltaY = sense.clientY - fromY;
        if ((deltaX * deltaX + deltaY * deltaY) > sense.options.smallMove * sense.options.smallMove) {
            // Move is sufficient => determine the type of move : arc or line
            if (sense.moves.length > 0) {
                if (a4p.isUndefined(sense.moves[sense.moves.length - 1].radius)) {
                    // Last move was a line move
                    var previousX = sense.startClientX;
                    var previousY = sense.startClientY;
                    if (sense.moves.length > 1) {
                        previousX = sense.moves[sense.moves.length - 2].x;
                        previousY = sense.moves[sense.moves.length - 2].y;
                    }
                    var center = getCircleCenter(previousX, previousY, fromX, fromY, sense.clientX, sense.clientY);
                    if (center != null) {
                        var radiusX = sense.clientX - center[0];
                        var radiusY = sense.clientY - center[1];
                        if ((radiusX * radiusX + radiusY * radiusY) < (sense.options.arcRadius * sense.options.arcRadius)) {
                            if (((radiusX * radiusX + radiusY * radiusY)) > (sense.options.smallMove * sense.options.smallMove)) {
                                // move is an arc move => replace previous line move
                                var angleStart = Math.atan2(previousY - center[1], previousX - center[0]); // in ]-PI, +PI]
                                var angleEnd = Math.atan2(radiusY, radiusX); // in ]-PI, +PI]
                                var rotation = angleEnd - angleStart;
                                sense.moves.splice(sense.moves.length - 1, 1, {
                                    x: sense.clientX, y: sense.clientY,
                                    centerx: center[0], centery: center[1],
                                    radius: Math.sqrt(radiusX * radiusX + radiusY * radiusY),
                                    start: angleStart, end: angleEnd,
                                    direction: ((rotation >= 0) ? 'right' : 'left')
                                });
                            } else {
                                // Move is too small in radius, but sufficient in line => new line move in other direction
                                sense.moves.push({
                                    x: sense.clientX, y: sense.clientY,
                                    deltaX: deltaX, deltaY: deltaY
                                });
                            }
                        } else {
                            // move is considered as a parallel line move (radius too big) => replace previous line move
                            sense.moves.splice(sense.moves.length - 1, 1, {
                                x: sense.clientX, y: sense.clientY,
                                deltaX: sense.clientX - previousX, deltaY: sense.clientY - previousY
                            });
                        }
                    } else {
                        // move is a parallel horizontal line move
                        if ((fromX - previousX) * deltaX >= 0) {
                            // Same direction => replace previous line move
                            sense.moves.splice(sense.moves.length - 1, 1, {
                                x: sense.clientX, y: sense.clientY,
                                deltaX: sense.clientX - previousX, deltaY: sense.clientY - previousY
                            });
                        } else {
                            // Opposite direction => add a new line move
                            sense.moves.push({
                                x: sense.clientX, y: sense.clientY,
                                deltaX: deltaX, deltaY: deltaY
                            });
                        }
                    }
                } else {
                    // Last move was an arc move
                    var radius = sense.moves[sense.moves.length - 1].radius;
                    var centerx = sense.moves[sense.moves.length - 1].centerx;
                    var centery = sense.moves[sense.moves.length - 1].centery;
                    var start = sense.moves[sense.moves.length - 1].start;
                    var end = sense.moves[sense.moves.length - 1].end;
                    var lastRadiusX = sense.clientX - centerx;
                    var lastRadiusY = sense.clientY - centery;
                    if (Math.abs((lastRadiusX * lastRadiusX + lastRadiusY * lastRadiusY) - radius * radius) <= (sense.options.smallMove * sense.options.smallMove)) {
                        // Same radius, that move can continue the previous arc move
                        var lastAngleEnd = Math.atan2(lastRadiusY, lastRadiusX); // in ]-PI, +PI]
                        var lastRotation = lastAngleEnd - end;
                        if ((end - start) * lastRotation >= 0) {
                            // Rotation in same direction => replace previous arc move
                            sense.moves.splice(sense.moves.length - 1, 1, {
                                x: sense.clientX, y: sense.clientY,
                                centerx: centerx, centery: centery,
                                radius: radius,
                                start: start, end: lastAngleEnd,
                                direction: ((lastRotation >= 0) ? 'right' : 'left')
                            });
                        } else {
                            // Rotation in opposite direction => add a new arc move
                            sense.moves.push({
                                x: sense.clientX, y: sense.clientY,
                                centerx: centerx, centery: centery,
                                radius: Math.sqrt(lastRadiusX * lastRadiusX + lastRadiusY * lastRadiusY),
                                start: start, end: lastAngleEnd,
                                direction: ((lastRotation >= 0) ? 'right' : 'left')
                            });
                        }
                    } else {
                        // Consider the new move as a line move
                        sense.moves.push({
                            x: sense.clientX, y: sense.clientY,
                            deltaX: deltaX, deltaY: deltaY
                        });
                    }
                }
            } else {
                // Consider the first move as a line move
                sense.moves.push({
                    x: sense.clientX, y: sense.clientY,
                    deltaX: deltaX, deltaY: deltaY
                });
            }
            return true;
        }
        return false;
    }

    function set2FingersScaleAndRotate(sense) {
        if (sense.fingers.length <= 1) return false;

        // Last positions
        var to1X = sense.clientX;
        var to1Y = sense.clientY;
        var to2X = sense.finger2.clientX;
        var to2Y = sense.finger2.clientY;
        // Previous positions
        var from1X = sense.moves[sense.moves.length - 1].x;
        var from1Y = sense.moves[sense.moves.length - 1].y;
        var from2X = from1X + sense.finger2.deltaFingerX;
        var from2Y = from1Y + sense.finger2.deltaFingerY;
        // Length of last move
        var delta1X = to1X - from1X;
        var delta1Y = to1Y - from1Y;
        var delta2X = to2X - from2X;
        var delta2Y = to2Y - from2Y;
        if (((delta1X * delta1X + delta1Y * delta1Y) > sense.options.smallMove * sense.options.smallMove)
            || ((delta2X * delta2X + delta2Y * delta2Y) > sense.options.smallMove * sense.options.smallMove)) {
            // Move is sufficient => Update scale and rotate values
            // Angles between 2 fingers lines at start and end of the move
            var angleStart = Math.atan2(sense.finger2.deltaFingerY, sense.finger2.deltaFingerX); // in ]-PI, +PI]
            var angleEnd = Math.atan2(sense.deltaFingerY, sense.deltaFingerX); // in ]-PI, +PI]
            sense.scale = Math.sqrt((sense.deltaFingerX * sense.deltaFingerX
                + sense.deltaFingerY * sense.deltaFingerY)
                / (sense.finger2.deltaFingerX * sense.finger2.deltaFingerX
                + sense.finger2.deltaFingerY * sense.finger2.deltaFingerY));
            sense.rotate = angleEnd - angleStart;
            if (Math.abs(sense.scale - 1.0) <= sense.options.smallScale) {
                sense.scale = 1.0;
            }
            if (Math.abs(sense.rotate) <= sense.options.smallRotation) {
                sense.rotate = 0.0;
            }
            return true;
        }
        return false;
    }

    // Gesture events utilities

    function onWhichEvent(sense, name, nbFinger) {
        var prefix = 'Short';
        if (sense.hasPaused) prefix = 'Long';
        var onEventName = 'on' + prefix + name + nbFinger;
        if (a4p.isDefined(sense[onEventName]) && (sense[onEventName] != null)) {
            return onEventName;
        }
        if (sense.options.prefixPriority) {
            // the 'Short'/'Long' prefix has priority over the number of fingers  : sense-long-tap before sense-tap-2
            onEventName = 'on' + prefix + name;
            if (a4p.isDefined(sense[onEventName]) && (sense[onEventName] != null)) {
                return onEventName;
            }
            onEventName = 'on' + name + nbFinger;
            if (a4p.isDefined(sense[onEventName]) && (sense[onEventName] != null)) {
                return onEventName;
            }
        } else {
            // the number of fingers has priority over the 'Short'/'Long' prefix  : sense-tap-2 before sense-long-tap
            onEventName = 'on' + name + nbFinger;
            if (a4p.isDefined(sense[onEventName]) && (sense[onEventName] != null)) {
                return onEventName;
            }
            onEventName = 'on' + prefix + name;
            if (a4p.isDefined(sense[onEventName]) && (sense[onEventName] != null)) {
                return onEventName;
            }
        }
        onEventName = 'on' + name;
        if (a4p.isDefined(sense[onEventName]) && (sense[onEventName] != null)) {
            return onEventName;
        }
        return '';
    }

    function executeEvent(sense, name, evt) {
        var onEventName = onWhichEvent(sense, name, evt.nbFinger);
        if (onEventName.length > 0) {
            try {
                sense[onEventName](evt);
            } catch (exception) {
                // handler may be destroyed
            }
            return true;
        }
        return false;
    }

    function isEventListened(sense, name, nbFinger) {
        var onEventName = onWhichEvent(sense, name, nbFinger);
        return (onEventName.length > 0);
    }

    // Drag and Drop utilities

    function clearDrops(sense) {
        sense.dropsStarted = [];
        sense.dropOver = null;
        sense.dropEvt = {
            dataType: 'text/plain',
            dataTransfer: ''
        };
    }

    function dndStart(sense) {
        for (var idx = dndables.length - 1; idx >= 0; idx--) {
            var dropSenseId = dndables[idx];
            var dropSense = dndablesMap[dropSenseId];
            executeEvent(dropSense, GST_DND_START, sense.dropEvt);
        }
    }

    function dndEnd(sense) {
        for (var idx = dndables.length - 1; idx >= 0; idx--) {
            var dropSenseId = dndables[idx];
            var dropSense = dndablesMap[dropSenseId];
            executeEvent(dropSense, GST_DND_END, sense.dropEvt);
        }
    }

    function dndCancel(sense) {
        for (var idx = dndables.length - 1; idx >= 0; idx--) {
            var dropSenseId = dndables[idx];
            var dropSense = dndablesMap[dropSenseId];
            executeEvent(dropSense, GST_DND_CANCEL, sense.dropEvt);
        }
    }

    function dragStart(sense) {
        // Because User should set dataTransfer attribute in DROP event
        // we must keep this DROP event structure for all the DROP life cycle
        sense.dropEvt.nbFinger = sense.fingers.length;
        sense.dropEvt.side = sense.side;
        sense.dropEvt.scale = sense.scale;
        sense.dropEvt.rotate = sense.rotate;
        sense.dropEvt.moves = sense.moves;
        sense.dropEvt.sourcePoints = sense.sourcePoints;
        sense.dropEvt.timeStamp = sense.timeStamp;
        // To get the position relative to the top-left corner of the browser window's client area, use the clientX and clientY properties.
        sense.dropEvt.clientX = sense.startClientX;
        sense.dropEvt.clientY = sense.startClientY;
        // To get the position relative to the top-left corner of the document, use the pageX and pageY properties.
        sense.dropEvt.pageX = sense.startPageX;
        sense.dropEvt.pageY = sense.startPageY;
        // Use a home-made fct instead of getBoundingClientRect() : BUT do not take into account translate() from webkitTransform
        //var box = findBoundingClientRect2(sense.DOMelement);
        var box = sense.DOMelement.getBoundingClientRect();
        // We must calculate from startClientX (the origin of all moves) and not only when drag is decided.
        //sense.dropEvt.elementX = sense.finger1.clientX - box.left;
        //sense.dropEvt.elementY = sense.finger1.clientY - box.top;
        sense.dropEvt.elementX = sense.startClientX - box.left;
        sense.dropEvt.elementY = sense.startClientY - box.top;
        // User should set sense.dropEvt.dataTransfer
        sense.triggerEvent(GST_DRAG_START, sense.dropEvt);
        dndStart(sense);
    }

    function dropStart(sense) {
        sense.dropEvt.nbFinger = sense.fingers.length;
        sense.dropEvt.side = sense.side;
        sense.dropEvt.scale = sense.scale;
        sense.dropEvt.rotate = sense.rotate;
        sense.dropEvt.moves = sense.moves;
        sense.dropEvt.sourcePoints = sense.sourcePoints;
        sense.dropEvt.timeStamp = sense.timeStamp;
        sense.dropEvt.clientX = sense.finger1.clientX;
        sense.dropEvt.clientY = sense.finger1.clientY;
        sense.dropEvt.pageX = sense.finger1.pageX;
        sense.dropEvt.pageY = sense.finger1.pageY;
        if (sense.dropOver != null) {
            var idx = sense.dropsStarted.indexOf(sense.dropOver);
            if (idx < 0) {
                sense.dropsStarted.push(sense.dropOver);
                executeEvent(droppablesMap[sense.dropOver], GST_DROP_START, sense.dropEvt);
            }
        }
    }

    function dropEnd(sense) {
        sense.dropEvt.nbFinger = sense.fingers.length;
        sense.dropEvt.side = sense.side;
        sense.dropEvt.scale = sense.scale;
        sense.dropEvt.rotate = sense.rotate;
        sense.dropEvt.moves = sense.moves;
        sense.dropEvt.sourcePoints = sense.sourcePoints;
        sense.dropEvt.timeStamp = sense.timeStamp;
        sense.dropEvt.clientX = sense.finger1.clientX;
        sense.dropEvt.clientY = sense.finger1.clientY;
        sense.dropEvt.pageX = sense.finger1.pageX;
        sense.dropEvt.pageY = sense.finger1.pageY;
        if (sense.dropsStarted.length > 0) {
            if (sense.dropOver != null) {
                sense.triggerEvent(GST_DRAG_OVER_LEAVE, sense.dropEvt);
                executeEvent(droppablesMap[sense.dropOver], GST_DROP_OVER_LEAVE, sense.dropEvt);
                sense.dropOver = null;
            }
            if (sense.scroll && sense.scroll.options.zoom) {
                //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onScrollEnd');
                if (sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale)) {
                    sense.evtTriggered = true;
                }
                /*
                 //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onZoomEnd');
                 if (sense.scroll.onZoomEnd(sense.scale)) {
                 sense.evtTriggered = true;
                 }
                 */
            }
            sense.triggerEvent(GST_DRAG_END, sense.dropEvt);
            sense.dropsStarted.forEach(function (targetId) {
                executeEvent(droppablesMap[targetId], GST_DROP_END, sense.dropEvt);
            });
            dndEnd(sense);
            clearDrops(sense);
        } else {
            dropCancel(sense);
        }
    }

    function dropCancel(sense) {
        sense.dropEvt.nbFinger = sense.fingers.length;
        sense.dropEvt.side = sense.side;
        sense.dropEvt.scale = sense.scale;
        sense.dropEvt.rotate = sense.rotate;
        sense.dropEvt.moves = sense.moves;
        sense.dropEvt.sourcePoints = sense.sourcePoints;
        sense.dropEvt.timeStamp = sense.timeStamp;
        sense.dropEvt.clientX = sense.finger1.clientX;
        sense.dropEvt.clientY = sense.finger1.clientY;
        sense.dropEvt.pageX = sense.finger1.pageX;
        sense.dropEvt.pageY = sense.finger1.pageY;
        if (sense.dropOver != null) {
            sense.triggerEvent(GST_DRAG_OVER_LEAVE, sense.dropEvt);
            executeEvent(droppablesMap[sense.dropOver], GST_DROP_OVER_LEAVE, sense.dropEvt);
            sense.dropOver = null;
        }
        if (sense.scroll && sense.scroll.options.zoom) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onScrollEnd');
            if (sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale)) {
                sense.evtTriggered = true;
            }
            /*
             //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onZoomEnd');
             if (sense.scroll.onZoomEnd(sense.scale)) {
             sense.evtTriggered = true;
             }
             */
        }
        sense.triggerEvent(GST_DRAG_CANCEL, sense.dropEvt);
        sense.dropsStarted.forEach(function (targetId) {
            executeEvent(droppablesMap[targetId], GST_DROP_CANCEL, sense.dropEvt);
        });
        dndCancel(sense);
        clearDrops(sense);
    }

    function findBoundingClientRect(obj) {
        var offsetLeft = 0, offsetTop = 0, width = obj.offsetWidth, height = obj.offsetHeight;
        do {
            offsetLeft += (obj.offsetLeft || 0);
            offsetTop += (obj.offsetTop || 0);
            while (obj.offsetParent) {
                obj = obj.offsetParent;
                offsetLeft += obj.offsetLeft;
                offsetTop += obj.offsetTop;
            }
        } while (obj = obj.parentNode);
        return {
            left: offsetLeft,
            top: offsetTop,
            width: width,
            height: height,
            right: offsetLeft + width - 1,
            bottom: offsetTop + height - 1
        };
    }

    // TODO : analyze and compare to another solution found at http://www.greywyvern.com/?post=331
    function findBoundingClientRect2(obj) {
        var offsetLeft = 0, offsetTop = 0, width = obj.offsetWidth, height = obj.offsetHeight;
        var scr = obj, fixed = false;
        while ((scr = scr.parentNode) && scr != document.body) {
            offsetLeft -= scr.scrollLeft || 0;
            offsetTop -= scr.scrollTop || 0;
            if (getStyle(scr, "position") == "fixed") fixed = true;
        }
        // You can take into account document.body.scrollLeft & document.body.scrollTop if you want to take into account global scroll of browser
        if (fixed && !window.opera) {
            var scrDist = scrollDist();
            offsetLeft += scrDist[0];
            offsetTop += scrDist[1];
        }
        do {
            offsetLeft += obj.offsetLeft;
            offsetTop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return {
            left: offsetLeft,
            top: offsetTop,
            width: width,
            height: height,
            right: offsetLeft + width - 1,
            bottom: offsetTop + height - 1
        };
    }

    function scrollDist() {
        var html = document.getElementsByTagName('html')[0];
        if (html.scrollTop && document.documentElement.scrollTop) {
            return [html.scrollLeft, html.scrollTop];
        } else if (html.scrollTop || document.documentElement.scrollTop) {
            return [
                html.scrollLeft + document.documentElement.scrollLeft,
                html.scrollTop + document.documentElement.scrollTop
            ];
        } else if (document.body.scrollTop)
            return [document.body.scrollLeft, document.body.scrollTop];
        return [0, 0];
    }

    function getStyle(obj, styleProp) {
        if (obj.currentStyle) {
            var y = obj.currentStyle[styleProp];
        } else if (window.getComputedStyle)
            var y = window.getComputedStyle(obj, null)[styleProp];
        return y;
    }

    function findDroppableSenseFromCoord(clientX, clientY) {
        var dropOverTargetId = null;
        var boxArea = -1;
        for (var idx = droppables.length - 1; idx >= 0; idx--) {
            var dropSenseId = droppables[idx];
            var dropSense = droppablesMap[dropSenseId];
            // Use a home-made fct instead of getBoundingClientRect() : BUT do not take into account translate() from webkitTransform
            //var box = findBoundingClientRect(dropSense.DOMelement);
            var box = dropSense.DOMelement.getBoundingClientRect();
            if ((box.left <= clientX) && (clientX <= box.right) && (box.top <= clientY) && (clientY <= box.bottom)) {
                if ((dropOverTargetId == null) || (box.height * box.width < boxArea)) {
                    /*
                     console.log('Drop over ' + dropSense.name + ' clientX=' + clientX + ', clientY='+clientY
                     + ', box.left='+box.left + ', box.right='+box.right
                     + ', box.top='+box.top + ', box.bottom='+box.bottom
                     + ', dropSense.DOMelement.clientTop='+dropSense.DOMelement.clientTop
                     + ', dropSense.DOMelement.clientLeft='+dropSense.DOMelement.clientLeft);
                     */
                    dropOverTargetId = dropSenseId;
                    boxArea = box.height * box.width;
                }
            }
        }
        return dropOverTargetId;
    }

    // Gesture utilities

    function startHoldGesture(sense) {
        sense.triggerEvent(GST_HOLD_START, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length
        });
    }

    function stopHoldGesture(sense) {
        sense.triggerEvent(GST_HOLD_STOP, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length
        });
    }

    function tapGesture(sense) {
        sense.triggerEvent(GST_TAP, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length
        });
    }

    function tapAndStartGestureIfMoves(sense) {
        add1FingerMove(sense);
        if (sense.moves.length > 0) {
            // Validate Tap and change to Drag gesture
            tapGesture(sense);
            startGesture(sense);// Go to state SWIPE, SCROLL or DRAG
        }
    }

    function startGestureIfMoves(sense) {
        add1FingerMove(sense);
        if (sense.moves.length > 0) {
            startGesture(sense);// Go to state SWIPE, SCROLL or DRAG
        }
    }

    function startGesture(sense) {
        // prerequisite : sense.moves.length > 0
        // prerequisite : sense.fingers.length > 0
        var move = sense.moves[sense.moves.length - 1];
        // SCROLL has priority over SWIPE if scroller has not attained its border => Ex : to scroll
        // DRAG has priority over SWIPE if scroller has not attained its border => Ex : to move a zoomed image
        if ((move.deltaY == 0) || (Math.abs(move.deltaX / move.deltaY) > sense.options.axeRatio)) {
            if (move.deltaX >= 0) {
                sense.side = 'right';
                if (sense.scroll && !sense.scroll.hasAttainedSideLeft()) {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' !hasAttainedSideLeft => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeX == 'scroll') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' scroll => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeX == 'swipe') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' swipe => startSwipeGesture');
                    startSwipeGesture(sense);
                    return;
                }
            } else {
                sense.side = 'left';
                if (sense.scroll && !sense.scroll.hasAttainedSideRight()) {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' !hasAttainedSideRight => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeX == 'scroll') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' scroll => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeX == 'swipe') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' swipe => startSwipeGesture');
                    startSwipeGesture(sense);
                    return;
                }
            }
        } else if ((move.deltaX == 0) || (Math.abs(move.deltaY / move.deltaX) > sense.options.axeRatio)) {
            if (move.deltaY >= 0) {
                sense.side = 'bottom';
                if (sense.scroll && !sense.scroll.hasAttainedSideTop()) {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' !hasAttainedSideTop => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeY == 'scroll') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' scroll => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeY == 'swipe') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' swipe => startSwipeGesture');
                    startSwipeGesture(sense);
                    return;
                }
            } else {
                sense.side = 'top';
                if (sense.scroll && !sense.scroll.hasAttainedSideBottom()) {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' !hasAttainedSideBottom => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeY == 'scroll') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' scroll => startScrollGesture');
                    startScrollGesture(sense);
                    return;
                } else if (sense.options.axeY == 'swipe') {
                    //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' swipe => startSwipeGesture');
                    startSwipeGesture(sense);
                    return;
                }
            }
        } else {
            sense.side = '';
            if (sense.scroll && sense.scroll.enabled && sense.scroll.options.zoom) {
                //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' zoom => startScrollGesture');
                startScrollGesture(sense);
                return;
            }
        }
        if (sense.fingers.length > 1) {
            set2FingersScaleAndRotate(sense);
        }
        sense.side = '';
        if (isEventListened(sense, GST_DRAG_START, sense.fingers.length)) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'startGesture ' + sense.side + ' drag Started');
            sense.gotoState(STATE_DRAGGING);
            dragStart(sense);
            dragGesture(sense);
        } else {
            // No SWIPE, SCROLL or DRAG but MOVE => cancel TAP
            sense.gotoState(STATE_0CLICK);
        }
    }

    function swipeGesture(sense) {
        if (sense.inPause) {
            sense.inPause = false;
            sense.startTimer(sense.options.holdTime);
        }
        sense.triggerEvent(GST_SWIPE_MOVE, {
            clientX: sense.clientX,
            clientY: sense.clientY,
            pageX: sense.pageX,
            pageY: sense.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
    }

    function startSwipeGesture(sense) {
        sense.gotoState(STATE_SWIPING);
        sense.triggerEvent(GST_SWIPE_START, {
            clientX: sense.startClientX,
            clientY: sense.startClientY,
            pageX: sense.startPageX,
            pageY: sense.startPageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
        swipeGesture(sense);
    }

    function continueSwipeGesture(sense) {
        add1FingerMove(sense);
        swipeGesture(sense);
    }

    function cancelSwipeGesture(sense) {
        sense.triggerEvent(GST_SWIPE_CANCEL, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
        sense.gotoState(STATE_0CLICK);
    }

    function endSwipeGesture(sense) {
        sense.triggerEvent(GST_SWIPE_END, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
        sense.gotoState(STATE_0CLICK);
    }

    function scrollGesture(sense) {
        if (sense.inPause) {
            sense.inPause = false;
            sense.startTimer(sense.options.holdTime);
        }
        if (sense.scroll && (sense.scroll.options.zoom || (sense.options.axeX == 'scroll') || (sense.options.axeY == 'scroll'))) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onScrollMove');
            if (sense.scroll.onScrollMove(sense.pageX, sense.pageY, sense.timeStamp, sense.scale)) {
                sense.evtTriggered = true;
            }
        }
        sense.triggerEvent(GST_SCROLL_MOVE, {
            clientX: sense.clientX,
            clientY: sense.clientY,
            pageX: sense.pageX,
            pageY: sense.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
    }

    function startScrollGesture(sense) {
        sense.gotoState(STATE_SCROLLING);
        if (sense.scroll && (sense.scroll.options.zoom || (sense.options.axeX == 'scroll') || (sense.options.axeY == 'scroll'))) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onScrollStart');
            if (sense.scroll.onScrollStart(sense.startPageX, sense.startPageY, sense.timeStamp)) {
                sense.evtTriggered = true;
            }
        }
        sense.triggerEvent(GST_SCROLL_START, {
            clientX: sense.startClientX,
            clientY: sense.startClientY,
            pageX: sense.startPageX,
            pageY: sense.startPageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
        scrollGesture(sense);
    }

    function continueScrollGesture(sense) {
        add1FingerMove(sense);
        if (sense.fingers.length > 1) {
            set2FingersScaleAndRotate(sense);
        }
        scrollGesture(sense);
    }

    function cancelScrollGesture(sense) {
        if (sense.scroll && (sense.scroll.options.zoom || (sense.options.axeX == 'scroll') || (sense.options.axeY == 'scroll'))) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onScrollEnd');
            if (sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale)) {
                sense.evtTriggered = true;
            }
        }
        sense.triggerEvent(GST_SCROLL_CANCEL, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
        sense.gotoState(STATE_0CLICK);
    }

    function endScrollGesture(sense) {
        if (sense.scroll && (sense.scroll.options.zoom || (sense.options.axeX == 'scroll') || (sense.options.axeY == 'scroll'))) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onScrollEnd');
            if (sense.scroll.onScrollEnd(sense.finger1.pageX, sense.finger1.pageY, sense.timeStamp, sense.scale)) {
                sense.evtTriggered = true;
            }
        }
        sense.triggerEvent(GST_SCROLL_END, {
            clientX: sense.finger1.clientX,
            clientY: sense.finger1.clientY,
            pageX: sense.finger1.pageX,
            pageY: sense.finger1.pageY,
            nbFinger: sense.fingers.length,
            side: sense.side,
            moves: sense.moves,
            sourcePoints: sense.sourcePoints,
            timeStamp: sense.timeStamp
        });
        sense.gotoState(STATE_0CLICK);
    }

    function dragGesture(sense) {
        if (sense.inPause) {
            sense.inPause = false;
            sense.startTimer(sense.options.holdTime);
        }
        sense.dropEvt.nbFinger = sense.fingers.length;
        sense.dropEvt.side = sense.side;
        sense.dropEvt.scale = sense.scale;
        sense.dropEvt.rotate = sense.rotate;
        sense.dropEvt.moves = sense.moves;
        sense.dropEvt.sourcePoints = sense.sourcePoints;
        sense.dropEvt.timeStamp = sense.timeStamp;
        sense.dropEvt.clientX = sense.clientX;
        sense.dropEvt.clientY = sense.clientY;
        sense.dropEvt.pageX = sense.pageX;
        sense.dropEvt.pageY = sense.pageY;
        if (sense.scroll && sense.scroll.options.zoom) {
            //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onScrollMove');
            if (sense.scroll.onScrollMove(sense.pageX, sense.pageY, sense.timeStamp, sense.scale)) {
                sense.evtTriggered = true;
            }
            /*
             if (sense.fingers.length > 1) {
             //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onZoomMove');
             if (sense.scroll.onZoomMove(sense.scale)) {
             sense.evtTriggered = true;
             }
             } else {
             //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'scroll.onZoomEnd');
             if (sense.scroll.onZoomEnd(sense.scale)) {
             sense.evtTriggered = true;
             }
             }
             */
        }
        sense.triggerEvent(GST_DRAG_MOVE, sense.dropEvt);
        var targetId = findDroppableSenseFromCoord(sense.clientX, sense.clientY);
        if (sense.dropOver != targetId) {
            if (sense.dropOver != null) {
                sense.triggerEvent(GST_DRAG_OVER_LEAVE, sense.dropEvt);
                executeEvent(droppablesMap[sense.dropOver], GST_DROP_OVER_LEAVE, sense.dropEvt);
                sense.dropOver = null;
            }
            if (targetId != null) {
                sense.dropOver = targetId;
                sense.triggerEvent(GST_DRAG_OVER_ENTER, sense.dropEvt);
                executeEvent(droppablesMap[targetId], GST_DROP_OVER_ENTER, sense.dropEvt);
            }
        }
        if (sense.dropOver != null) {
            executeEvent(droppablesMap[sense.dropOver], GST_DROP_MOVE, sense.dropEvt);
        }
    }

    function continueDragGesture(sense) {
        var viewportWidth = document.documentElement.clientWidth;
        var viewportHeight = document.documentElement.clientHeight;
        if ((sense.finger1.clientX < sense.options.smallMove)
            || (sense.finger1.clientX > (viewportWidth - sense.options.smallMove))
            || (sense.finger1.clientY < sense.options.smallMove)
            || (sense.finger1.clientY > (viewportHeight - sense.options.smallMove))) {
            // Cancel gesture if touch go out of viewport
            dropCancel(sense);
            sense.gotoState(STATE_0CLICK);
        } else {
            add1FingerMove(sense);
            if (sense.fingers.length > 1) {
                set2FingersScaleAndRotate(sense);
            }
            dragGesture(sense);
        }
    }

    // Geometry utilities

    function getMousePageX(evt) {
        var body = document.body;
        evt = evt || window.event;
        return (evt.pageX ||
        evt.clientX + ( document && document.scrollLeft || body && body.scrollLeft || 0 )
        - ( document && document.clientLeft || body && body.clientLeft || 0 ));
    }

    function getMousePageY(evt) {
        var body = document.body;
        evt = evt || window.event;
        return (evt.pageY ||
        evt.clientY + ( document && document.scrollTop || body && body.scrollTop || 0 )
        - ( document && document.clientTop || body && body.clientTop || 0 ));
    }

    function getCircleCenter(x1, y1, x2, y2, x3, y3) {
        if ((y1 == y2) && (y2 == y3)) {
            return null;
        }
        var dx3, dx2, dx1, nx3, nx2, nx1, x0, y0;
        if (y3 == y2) {
            // y1 != y2 and y1 != y3
            dx3 = (x2 - x1) / (y2 - y1);
            dx2 = (x3 - x1) / (y3 - y1);
            nx2 = (dx2 * (x3 + x1) + (y3 + y1)) / 2;
            nx3 = (dx3 * (x2 + x1) + (y2 + y1)) / 2;
            x0 = (nx2 - nx3) / (dx3 - dx2);
            y0 = dx3 * x0 + nx3;
        } else if (y2 == y1) {
            // y1 != y3 and y2 != y3
            dx1 = (x3 - x2) / (y3 - y2);
            dx2 = (x3 - x1) / (y3 - y1);
            nx2 = (dx2 * (x3 + x1) + (y3 + y1)) / 2;
            nx1 = (dx1 * (x3 + x2) + (y3 + y2)) / 2;
            x0 = (nx2 - nx1) / (dx1 - dx2);
            y0 = dx1 * x0 + nx1;
        } else {// y3 == y1 possible
            // y1 != y2 and y2 != y3
            dx3 = (x2 - x1) / (y2 - y1);
            dx1 = (x3 - x2) / (y3 - y2);
            nx1 = (dx1 * (x3 + x2) + (y3 + y2)) / 2;
            nx3 = (dx3 * (x2 + x1) + (y2 + y1)) / 2;
            x0 = (nx1 - nx3) / (dx3 - dx1);
            y0 = dx3 * x0 + nx3;
        }
        return [x0, y0];
    }

    /*
     function documentXToViewportX(x) {
     return x - window.pageXOffset;
     }

     function documentYToViewportY(y) {
     return y - window.pageYOffset;
     }

     function viewportXToDocumentX(x) {
     return x + window.pageXOffset;
     }

     function viewportYToDocumentY(y) {
     return y + window.pageYOffset;
     }

     function elementFromPointIsUsingViewPortCoordinates() {
     if (window.pageYOffset > 0) {     // page scrolled down
     return (window.document.elementFromPoint(0, window.pageYOffset + window.innerHeight - 1) == null);
     } else if (window.pageXOffset > 0) {   // page scrolled to the right
     return (window.document.elementFromPoint(window.pageXOffset + window.innerWidth - 1, 0) == null);
     }
     return false; // no scrolling, don't care
     }

     var usingViewPortCoordinates = elementFromPointIsUsingViewPortCoordinates();

     function elementFromDocumentPoint(x, y) {
     if (usingViewPortCoordinates) {
     return window.document.elementFromPoint(documentXToViewportX(x), documentYToViewportY(y));
     } else {
     return window.document.elementFromPoint(x, y);
     }
     }

     function elementFromViewportPoint(x, y) {
     if (usingViewPortCoordinates) {
     return window.document.elementFromPoint(x, y);
     } else {
     return window.document.elementFromPoint(viewportXToDocumentX(x), viewportYToDocumentY(y));
     }
     }
     */

    function Sense(element, options, scrollOpts) {
        // State
        this.id = nextUid();
        this.name = this.id;
        this.state = STATE_0CLICK;
        this.createScroll = false;
        clearFingers(this);
        clearDrops(this);
        this.bindTouchStart = false;
        this.bindTouchMove = false;
        this.bindTouchEnd = false;
        this.bindTouchCancel = false;
        this.bindMouseDown = false;
        /*
         this.bindMouseMove = false;
         this.bindMouseUp = false;
         */
        this.bindMouseOther = false;
        this.hasPaused = false;
        this.inPause = false;
        this.inMouseMove = false;
        this.inTouchMove = false;
        this.holdTimer = null;
        this.scroll = null;
        this.checkDOMTimer = null;
        this.timeStamp = 0;
        this.wheelDeltaX = 0;
        this.wheelDeltaY = 0;

        this.element = element;// JQLite element
        // DOM element
        if (typeof(element) == 'object') {
            this.DOMelement = element[0];
        } else {
            this.DOMelement = document.getElementById(element);
        }
        this.destroyListener = null;

        // Default options
        this.options = {
            name: "",
            axeX: '', // ''|'swipe'|'scroll'
            axeY: '', // ''|'swipe'|'scroll'
            defaultAction: false, // true if you want to activate defaultAction upon events
            bubble: false, // true if you want to bubble events upward in DOM in case Sense have treated it
            prefixPriority: false,// by default the number of fingers has priority over the 'Short'/'Long' prefix (ex: sense-tap-2 before sense-long-tap)
            smallMove: 10, // minimal move in pixels to accept a real move (to ignore shakings)
            smallScale: 0.1, // minimal scale change
            smallRotation: 0.25, // minimal rotate angle (radians)
            doubleTime: 250, // maximal inactivity time after a DOWN to start double DOWN
            holdTime: 300, // minimal inactivity time after a DOWN to start HOLDING state
            arcRadius: 500, // maximal radius to stay into CIRCLE gesture (pass into LINE after)
            axeRatio: 2.5, // Y/X or X/Y minimal ratio to be parallel to an axe (nearly 45/2 degrees, must be > 1)
            callApply: false, // use $apply on every event/gesture sense directive
            checkDOMChanges: false // Check DOM changes every 500 ms to refresh scrolls
        };
        this.scrollOptions = {
            name: "",
            hScroll: scrollOpts['zoom'],
            vScroll: scrollOpts['zoom']
        };

        // User defined options
        for (var optKey in options) {
            if (!options.hasOwnProperty(optKey)) continue;
            this.options[optKey] = options[optKey];
            if (optKey == 'name') {
                this.name = options[optKey];
                this.scrollOptions.name = options[optKey];
            }
        }
        for (var scrollOptKey in scrollOpts) {
            if (!scrollOpts.hasOwnProperty(scrollOptKey)) continue;
            this.scrollOptions[scrollOptKey] = scrollOpts[scrollOptKey];
            this.createScroll = true;
        }
        if ((this.options.axeX == 'scroll') || (this.options.axeY == 'scroll')) {
            if (this.options.axeX == 'scroll') {
                this.scrollOptions.hScroll = true;
                this.createScroll = true;
            }
            if (this.options.axeY == 'scroll') {
                this.scrollOptions.vScroll = true;
                this.createScroll = true;
            }
        }

        bindOnStart(this, this.createScroll);

        var self = this;

        // BUG : element not destroyed (element $destroy not fired, but scope $destroy is fired)
        this.element.bind('$destroy', function () {
            self.destroy();
        });


        if (this.createScroll) {
            self.scroll = new a4p.Scroll(element, self.scrollOptions);
        }

        window.setTimeout(function () {
            self.sizeRefresh();
            if (self.options.checkDOMChanges) {
                self.checkDOMTimer = setInterval(function () {
                    self.sizeRefresh();
                }, 500);
            }
        }, 750);
    }

    Sense.hasTouch = miapp.BrowserCapabilities.hasTouch;

    Sense.prototype.destroy = function () {
        if (this.destroyListener != null) {
            this.destroyListener();
        }
        // Unbind
        unbindStart(this);
        unbindOther(this);
        if (this.checkDOMTimer) {
            clearInterval(this.checkDOMTimer);
            this.checkDOMTimer = null;
        }
        // Unregister
        var idx = dndables.indexOf(this.id);
        if (idx >= 0) {
            dndables.splice(idx, 1);
        }
        delete dndablesMap[this.id];
        idx = droppables.indexOf(this.id);
        if (idx >= 0) {
            droppables.splice(idx, 1);
        }
        delete droppablesMap[this.id];
        // Delete
        if (this.scroll) {
            if (this.scroll.destroy) this.scroll.destroy();
            this.scroll = null;
        }
        //a4p.InternalLog.log("a4p.sense", "del Sense " + this.name);
        return true;
    };

    Sense.prototype.addHandler = function (eventName, handler) {
        this['on' + eventName] = handler;
        // Register this droppable zone
        var self = this;
        var baseEventName = eventNameWithoutPrefixNorNbFinger(eventName);
        if ((baseEventName == GST_DROP_OVER_ENTER) || (baseEventName == GST_DROP_START)) {
            var dropIdx = droppables.indexOf(this.id);
            if (dropIdx < 0) {
                droppables.push(this.id);
            }
            droppablesMap[this.id] = self;
        }
        if ((baseEventName == GST_DND_START) || (baseEventName == GST_DND_END) || (baseEventName == GST_DND_CANCEL)) {
            var dndIdx = dndables.indexOf(this.id);
            if (dndIdx < 0) {
                dndables.push(this.id);
            }
            dndablesMap[this.id] = self;
        }
    };

    Sense.prototype.sizeRefresh = function () {
        if (this.scroll) {
            var self = this;
            window.setTimeout(function () {
                if (self.scroll && self.scroll.checkDOMChanges()) {
                    self.scroll.refresh();
                }
            }, 300);
        }
    };

    // Triggering User events via angular directives

    Sense.prototype.triggerEvent = function (name, evt) {
        //a4p.InternalLog.log('a4p.Sense ' + this.name + ' ' + this.state, 'triggerEvent ' + name);
        var eventFound = executeEvent(this, name, evt);
        if (eventFound) this.evtTriggered = true;
        return eventFound;
    };

    /**
     * Integration with angular directives
     *
     * @param directiveModule
     */
    Sense.declareDirectives = function (directiveModule) {
        var allEvents = [];
        for (var evtIdx = 0, evtNb = Sense.ALL_EVENTS.length; evtIdx < evtNb; evtIdx++) {
            var name = Sense.ALL_EVENTS[evtIdx];
            allEvents.push(name);
            allEvents.push('Short' + name);
            allEvents.push('Long' + name);
            for (var i = 1; i <= 5; i++) {
                allEvents.push(name + i);
                allEvents.push('Short' + name + i);
                allEvents.push('Long' + name + i);
            }
        }
        angular.forEach(allEvents, function (name) {
            var directiveName = "sense" + name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
            var eventName = name.charAt(0).toUpperCase() + name.slice(1);
            //console.log("angular.forEach "+directiveName+" "+eventName);
            directiveModule.directive(directiveName, ['$parse', '$rootScope', function ($parse, $rootScope) {
                return function (scope, element, attr) {
                    // Create only 1 Sense object for this DOM element
                    var sense = element.data("sense");
                    if (a4p.isUndefined(sense)) {
                        sense = Sense.newSense($parse, $rootScope, scope, element, attr);
                        var initFn = $parse(sense.options['init']);
                        initFn(scope, {$sense: sense});
                    }
                    /*opts = {};
                     var optionsName = directiveName + "Opts";
                     if (a4p.isDefined(attr[optionsName])) {
                     opts = $parse(attr[optionsName])(scope, {});
                     }
                     sense.setOpts(eventName, opts);*/
                    var fn = $parse(attr[directiveName]);
                    sense.addHandler(eventName, function (event) {
                        if (sense.options['callApply']) {
                            a4p.safeApply(scope, function () {
                                fn(scope, {$event: event, $element: element});
                                //fn(scope, [event,element]);
                            });
                        } else {
                            fn(scope, {$event: event, $element: element});
                            //fn(scope, [event,element]);
                        }
                    });
                };
            }]);
        });
        directiveModule.directive('senseOpts', ['$parse', '$rootScope', function ($parse, $rootScope) {
            return function (scope, element, attr) {
                // Create only 1 Sense object for this DOM element
                var sense = element.data("sense");
                if (a4p.isUndefined(sense)) {
                    sense = Sense.newSense($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(sense.options['init']);
                    initFn(scope, {$sense: sense});
                }
            };
        }]);
        directiveModule.directive('senseScrollopts', ['$parse', '$rootScope', function ($parse, $rootScope) {
            return function (scope, element, attr) {
                // Create only 1 Sense object for this DOM element
                var sense = element.data("sense");
                if (a4p.isUndefined(sense)) {
                    sense = Sense.newSense($parse, $rootScope, scope, element, attr);
                    var initFn = $parse(sense.options['init']);
                    initFn(scope, {$sense: sense});
                }
            };
        }]);

        /**
         * Attach the element as inifinite loop list container for the first parent having a sense
         */
        directiveModule.directive('senseLoop', ['$parse', function ($parse) {
            return function (scope, element, attr) {
                var list = element[0];
                var senseWrapper;
                var parent = element[0].parentNode;
                if (a4p.isDefinedAndNotNull(parent)) {
                    senseWrapper = angular.element(parent).data("sense");
                    while (a4p.isUndefined(senseWrapper) && a4p.isDefinedAndNotNull(parent.parentNode)) {
                        parent = parent.parentNode;
                        senseWrapper = angular.element(parent).data("sense");
                    }
                }
                if (a4p.isDefinedAndNotNull(senseWrapper)) {
                    var scrollOptions;
                    if (a4p.isDefinedAndNotNull(senseWrapper.scroll)) {
                        // Scroll already exists => change directly its options
                        scrollOptions = senseWrapper.scroll.options;
                    } else {
                        // Scroll not yet created => change sense scrollOptions
                        scrollOptions = senseWrapper.scrollOptions;
                    }

                    var callApply = attr['callApply'];
                    var onElementMove = $parse(attr['onElementMove']);

                    scrollOptions.hScrollbar = false;
                    scrollOptions.vScrollbar = false;
                    scrollOptions.virtualLoop = true;
                    // normalization required
                    scrollOptions.bounce = false;
                    scrollOptions.virtualLoop = true;
                    scrollOptions.onBeforeScrollMove = function (deltaX, deltaY) {
                        // scroller must stay around scroll.x and scroll.y specified in options
                        var initX = senseWrapper.scroll.options.x || 0;
                        var initY = senseWrapper.scroll.options.y || 0;
                        var first, last, nb;
                        if ((this.y + deltaY) > initY) {
                            // move last at first position
                            last = list.children[list.children.length - 1];
                            var lastHeight = last.offsetHeight;// Save it because it becomes 0 after move
                            nb = Math.round((this.y + deltaY - initY) / lastHeight);
                            //for (var i=nb;i>0;i--) {
                            //var last = list.children[list.children.length-1];
                            //list.insertBefore(last, list.children[0]);
                            //}
                            if (nb > 0) {
                                this.y -= nb * lastHeight;
                                if (callApply) {
                                    a4p.safeApply(scope, function () {
                                        onElementMove(scope, {$side: 'top', $nb: nb});
                                    });
                                } else {
                                    onElementMove(scope, {$side: 'top', $nb: nb});
                                }
                            }
                        } else if ((this.y + deltaY) < initY) {
                            // move first to last position
                            first = list.children[0];
                            var firstHeight = first.offsetHeight;// Save it because it becomes 0 after move
                            nb = Math.round((initY - this.y - deltaY) / firstHeight);
                            //for (var i=nb;i>0;i--) {
                            //var first = list.children[0];
                            //list.appendChild(first);
                            //}
                            if (nb > 0) {
                                this.y += nb * firstHeight;
                                if (callApply) {
                                    a4p.safeApply(scope, function () {
                                        onElementMove(scope, {$side: 'bottom', $nb: nb});
                                    });
                                } else {
                                    onElementMove(scope, {$side: 'bottom', $nb: nb});
                                }
                            }
                        }
                        if ((this.x + deltaX) > initX) {
                            // move last at first position
                            last = list.children[list.children.length - 1];
                            var lastWidth = last.offsetWidth;// Save it because it becomes 0 after move
                            nb = Math.round((this.x + deltaX - initX) / lastWidth);
                            //for (var i=nb;i>0;i--) {
                            //var last = list.children[list.children.length-1];
                            //list.insertBefore(last, list.children[0]);
                            //}
                            if (nb > 0) {
                                this.x -= nb * lastWidth;
                                if (callApply) {
                                    a4p.safeApply(scope, function () {
                                        onElementMove(scope, {$side: 'left', $nb: nb});
                                    });
                                } else {
                                    onElementMove(scope, {$side: 'left', $nb: nb});
                                }
                            }
                        } else if ((this.x + deltaX) < initX) {
                            // move first to last position
                            first = list.children[0];
                            var firstWidth = first.offsetWidth;// Save it because it becomes 0 after move
                            nb = Math.round((initX - this.x - deltaX) / firstWidth);
                            //for (var i=nb;i>0;i--) {
                            //var first = list.children[0];
                            //list.appendChild(first);
                            //}
                            if (nb > 0) {
                                this.x += nb * firstWidth;
                                if (callApply) {
                                    a4p.safeApply(scope, function () {
                                        onElementMove(scope, {$side: 'right', $nb: nb});
                                    });
                                } else {
                                    onElementMove(scope, {$side: 'right', $nb: nb});
                                }
                            }
                        }
                    };
                }
            };
        }]);
    };

    Sense.newSense = function ($parse, $rootScope, scope, element, attr) {
        var sense;
        var opts = {};
        var scrollOpts = {};

        if (a4p.isDefined(attr['senseOpts'])) {
            opts = $parse(attr['senseOpts'])(scope, {});
        }

        if (a4p.isDefined(attr['senseScrollopts'])) {
            scrollOpts = $parse(attr['senseScrollopts'])(scope, {});
        }
        sense = new a4p.Sense(element, opts, scrollOpts);
        element.data("sense", sense);
        // User function callable from Angular context
        /*
         scope.pullDownAction = function() {
         window.setTimeout(function() {
         scope.theList.splice(0, 1, 'Generated row ' + (new Date()).getTime());
         }, 1000);// Simulate network latency
         };
         scope.pullUpAction = function() {
         window.setTimeout(function() {
         scope.theList.push('Generated row ' + (new Date()).getTime());
         }, 1000);// Simulate network latency
         };
         */
        scope.getSenseId = function () {
            return sense.id;
        };
        scope.getSenseName = function () {
            return sense.name;
        };

        if (sense.createScroll) {
            scope.senseScrollToElement = function (eltQuery, timeMs) {
                sense.scroll.scrollToElement(eltQuery, timeMs);
            };
            scope.senseScrollToPage = function (pageX, pageY, timeMs) {
                // pageX and pageY can also be 'prev' or 'next'
                sense.scroll.scrollToPage(pageX, pageY, timeMs);
            };
            scope.senseScrollTo = function (x, y, timeMs, relative) {
                //console.log('Scroll : senseScrollTo() x=' + x + ' y=' + y);
                sense.scroll.scrollTo(x, y, timeMs, relative);
            };
            scope.scrollRefresh = function () {
                sense.sizeRefresh();
            };
            if (attr['senseAfterscrollend']) {
                var scrollOptions;
                if (a4p.isDefinedAndNotNull(sense.scroll)) {
                    // Scroll already exists => change directly its options
                    scrollOptions = sense.scroll.options;
                } else {
                    // Scroll not yet created => change sense scrollOptions
                    scrollOptions = sense.scrollOptions;
                }
                var fn = $parse(attr['senseAfterscrollend']);
                if (sense.options['callApply']) {
                    scrollOptions.onAfterScrollEnd = function () {
                        var x = this.x, y = this.y;// Scroll.x and Scroll.y
                        a4p.safeApply(scope, function () {
                            fn(scope, {$x: x, $y: y});
                        });
                    };
                } else {
                    scrollOptions.onAfterScrollEnd = function () {
                        var x = this.x, y = this.y;// Scroll.x and Scroll.y
                        fn(scope, {$x: x, $y: y});
                    };
                }
            }

            // Create only 1 Resize object for this DOM element to be called upon each resize event
            var resize = element.data("resize");
            if (a4p.isUndefined(resize)) {
                resize = a4p.Resize.newResize($parse, $rootScope, scope, element, attr);
            }
            resize['toSenseWindow'] = function () {
                sense.sizeRefresh();
            };
            resize['toSenseChanged'] = function () {
                sense.sizeRefresh();
            };
        }
        if (a4p.isDefined(sense.options['watchRefresh'])) {
            if (typeof sense.options['watchRefresh'] == "string") {
                scope.$watch(sense.options['watchRefresh'], function (newValue, oldValue) {
                    if (newValue === oldValue) return; // initialization
                    sense.sizeRefresh();
                });
            } else {
                for (var i = 0, nb = sense.options['watchRefresh'].length; i < nb; i++) {
                    scope.$watch(sense.options['watchRefresh'][i], function (newValue, oldValue) {
                        if (newValue === oldValue) return; // initialization
                        sense.sizeRefresh();
                    });
                }
            }
        }
        sense.sizeRefresh();
        //a4p.InternalLog.log("a4p.sense", "new Sense " + sense.name);
        return sense;
    };

    // Basic events transmitted to user

    var EVT_TOUCH_START = 'Touchstart';
    var EVT_TOUCH_MOVE = 'Touchmove';
    var EVT_TOUCH_END = 'Touchend';
    var EVT_TOUCH_CANCEL = 'Touchcancel';
    var EVT_MOUSE_DOWN = 'Mousedown';
    var EVT_MOUSE_MOVE = 'Mousemove';
    var EVT_MOUSE_UP = 'Mouseup';

    // Gesture user events sent to Sense angular directives

    var GST_HOLD_START = 'HoldStart'; // => onHold, onHold(1:5)
    var GST_HOLD_STOP = 'HoldStop'; // => onHoldCancel, onHoldCancel(1:5)

    var GST_TAP = 'Tap';            // => onTap, onTap(1:5)
    var GST_DOUBLE_TAP = 'DoubleTap';      // => onDoubleTap, onDoubleTap(1:5)

    // DRAG gesture on draggable object if axeX!=(swipe/scroll) or axeY!=(swipe/scroll) in senseOpts
    var GST_DRAG_OVER_ENTER = 'DragOverEnter';  // => onDragOverEnter, onDragOverEnter(1:5)
    var GST_DRAG_OVER_LEAVE = 'DragOverLeave';  // => onDragOverLeave, onDragOverLeave(1:5)
    var GST_DRAG_START = 'DragStart';      // => onDragStart, onDragStart(1:5)
    var GST_DRAG_PAUSE = 'DragPause';    // => onDragPause, onDragPause(1:5)
    var GST_DRAG_MOVE = 'DragMove';       // => onDragMove, onDragMove(1:5)
    var GST_DRAG_END = 'DragEnd';        // => onDragEnd, onDragEnd(1:5)
    var GST_DRAG_CANCEL = 'DragCancel';     // => onDragCancel, onDragCancel(1:5)

    // DROP gesture on droppable object
    // an object is droppable ONLY if it listens on GST_DROP_OVER_ENTER or GST_DROP_START
    var GST_DROP_OVER_ENTER = 'DropOverEnter';  // => onDropOverEnter, onDropOverEnter(1:5)
    var GST_DROP_OVER_LEAVE = 'DropOverLeave';  // => onDropOverLeave, onDropOverLeave(1:5)
    var GST_DROP_START = 'DropStart';      // => onDropStart, onDropStart(1:5)
    var GST_DROP_MOVE = 'DropMove';       // => onDropMove, onDropMove(1:5)
    var GST_DROP_END = 'DropEnd';        // => onDropEnd, onDropEnd(1:5)
    var GST_DROP_CANCEL = 'DropCancel';     // => onDropCancel, onDropCancel(1:5)

    // DND events AFTER DRAG/DROP events
    var GST_DND_START = 'DndStart';      // => onDndStart, onDndStart(1:5)
    var GST_DND_END = 'DndEnd';        // => onDndEnd, onDndEnd(1:5)
    var GST_DND_CANCEL = 'DndCancel';     // => onDndCancel, onDndCancel(1:5)

    // SWIPE gesture if axeX==swipe or axeY==swipe in senseOpts
    var GST_SWIPE_START = 'SwipeStart';     // => onSwipeStart, onSwipeStart(1:5)
    var GST_SWIPE_PAUSE = 'SwipePause';     // => onSwipePause, onSwipePause(1:5)
    var GST_SWIPE_MOVE = 'SwipeMove';      // => onSwipeMove, onSwipeMove(1:5)
    var GST_SWIPE_END = 'SwipeEnd';       // => onSwipeEnd, onSwipeEnd(1:5)
    var GST_SWIPE_CANCEL = 'SwipeCancel';    // => onSwipeCancel, onSwipeCancel(1:5)

    // SWIPE gesture if axeX==scroll or axeY==scroll in senseOpts
    var GST_SCROLL_START = 'ScrollStart';    // => onScrollStart, onScrollStart(1:5)
    var GST_SCROLL_PAUSE = 'ScrollPause';    // => onScrollPause, onScrollPause(1:5)
    var GST_SCROLL_MOVE = 'ScrollMove';     // => onScrollMove, onScrollMove(1:5)
    var GST_SCROLL_END = 'ScrollEnd';      // => onScrollEnd, onScrollEnd(1:5)
    var GST_SCROLL_CANCEL = 'ScrollCancel';   // => onScrollCancel, onScrollCancel(1:5)

    Sense.ALL_EVENTS = [
        EVT_TOUCH_START, EVT_TOUCH_MOVE, EVT_TOUCH_END, EVT_TOUCH_CANCEL,
        EVT_MOUSE_DOWN, EVT_MOUSE_MOVE, EVT_MOUSE_UP,
        GST_TAP, GST_DOUBLE_TAP, GST_HOLD_START, GST_HOLD_STOP,
        GST_DRAG_OVER_ENTER, GST_DRAG_OVER_LEAVE, GST_DRAG_START, GST_DRAG_PAUSE, GST_DRAG_MOVE, GST_DRAG_END, GST_DRAG_CANCEL,
        GST_DND_START, GST_DND_END, GST_DND_CANCEL,
        GST_DROP_OVER_ENTER, GST_DROP_OVER_LEAVE, GST_DROP_START, GST_DROP_MOVE, GST_DROP_END, GST_DROP_CANCEL,
        GST_SWIPE_START, GST_SWIPE_PAUSE, GST_SWIPE_MOVE, GST_SWIPE_END, GST_SWIPE_CANCEL,
        GST_SCROLL_START, GST_SCROLL_PAUSE, GST_SCROLL_MOVE, GST_SCROLL_END, GST_SCROLL_CANCEL
    ];

    // States of our Finite State Machine

    var STATE_0CLICK = '0click';
    var STATE_1DOWN = '1down';
    var STATE_1CLICK = '1click';
    var STATE_2DOWN = '2down';
    var STATE_SWIPING = 'swiping';
    var STATE_SCROLLING = 'scrolling';
    var STATE_DRAGGING = 'dragging';

    // Event handlers of our Finite State Machine

    var onEnter = {};
    var onExit = {};
    var onTimeout = {};
    var onTouchStart = {};
    var onTouchMove = {};
    var onTouchEnd = {};
    var onTouchCancel = {};
    var onMouseDown = {};
    var onMouseMove = {};
    var onMouseUp = {};

    Sense.prototype.resetState = function () {
        this.clearTimeout();
        clearDrops(this);
        unbindOther(this);
        this.hasPaused = false;
        this.inPause = false;
        this.inMouseMove = false;
        this.inTouchMove = false;
        this.evtHandled = false;
        this.evtTriggered = false;
        this.state = STATE_0CLICK;
        onEnter[STATE_0CLICK].call(this);
    };

    Sense.prototype.gotoState = function (state) {
        onExit[this.state].call(this);
        this.state = state;
        onEnter[this.state].call(this);
    };

    // Timer utilities

    Sense.prototype.handleTimeout = function () {
        this.holdTimer = null;
        onTimeout[this.state].call(this);
    };

    Sense.prototype.clearTimeout = function () {
        if (this.holdTimer != null) {
            clearTimeout(this.holdTimer);
            this.holdTimer = null;
        }
    };

    Sense.prototype.startTimer = function (ms) {
        if (this.holdTimer != null) {
            clearTimeout(this.holdTimer);
        }
        var self = this;
        this.holdTimer = window.setTimeout(function () {
            self.handleTimeout();
        }, ms);
    };

    // States

    // 0CLICK state waits for all fingers be UP before starting a new gesture
    onEnter[STATE_0CLICK] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onEnter');
        this.hasPaused = false;
        this.inPause = false;
        clearFingers(this);
    };
    onExit[STATE_0CLICK] = function () {
    };
    onTimeout[STATE_0CLICK] = function () {
    };
    onTouchStart[STATE_0CLICK] = function (evt) {
        // Analyse
        if (this.fingers.length <= 0) {
            this.evtHandled = true;
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var finger = evt.changedTouches[i];
                var id = finger.identifier;
                addTouchFinger(this, id, finger);
            }
            addSourcePoint(this);
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_START, evt);
            this.gotoState(STATE_1DOWN);
        }
    };
    onTouchMove[STATE_0CLICK] = function (evt) {
    };
    onTouchEnd[STATE_0CLICK] = function (evt) {
        // Analyse
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_END, evt);
        }
    };
    onTouchCancel[STATE_0CLICK] = function (evt) {
        // Analyse
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_CANCEL, evt);
        }
    };
    onMouseDown[STATE_0CLICK] = function (evt) {
        // Analyse
        if (this.fingers.length <= 0) {
            this.evtHandled = true;
            var id = 'mouse' + (evt.which || 0);
            addMouseFinger(this, id, evt);
            addSourcePoint(this);
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_DOWN, evt);
            this.gotoState(STATE_1DOWN);
        }
    };
    onMouseMove[STATE_0CLICK] = function (evt) {
    };
    onMouseUp[STATE_0CLICK] = function (evt) {
        // Analyse
        var id = 'mouse' + (evt.which || 0);
        if (removeFinger(this, id)) {
            this.evtHandled = true;
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_UP, evt);
        }
    };

    onEnter[STATE_1DOWN] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onEnter');
        this.inPause = false;
        this.startTimer(this.options.holdTime);
    };
    onExit[STATE_1DOWN] = function () {
        this.clearTimeout();
    };
    onTimeout[STATE_1DOWN] = function () {
        startHoldGesture(this);
        this.inPause = true;
        this.hasPaused = true;
    };
    onTouchStart[STATE_1DOWN] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            addTouchFinger(this, id, finger);
        }
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_TOUCH_START, evt);
    };
    onTouchMove[STATE_1DOWN] = function (evt) {
        // Analyse
        if (this.inPause) {
            this.clearTimeout();
            stopHoldGesture(this);
            this.inPause = false;
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (hasFinger(this, id)) {
                this.evtHandled = true;
                setTouchFinger(this, id, finger);
                if (this.finger1.id == id) {
                    addSourcePoint(this);
                }
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_MOVE, evt);
            startGestureIfMoves(this);
        }
    };
    onTouchEnd[STATE_1DOWN] = function (evt) {
        // Analyse
        if (this.inPause) {
            this.clearTimeout();
            stopHoldGesture(this);
            this.inPause = false;
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        // Validate GESTURE as soon as ONE finger is UP
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_END, evt);
            var onEventName = onWhichEvent(this, GST_DOUBLE_TAP, evt.nbFinger);
            if (onEventName.length > 0) {
                this.gotoState(STATE_1CLICK);
            } else {
                tapGesture(this);
                this.gotoState(STATE_0CLICK);
            }
        }
    };
    onTouchCancel[STATE_1DOWN] = function (evt) {
        // Analyse
        if (this.inPause) {
            this.clearTimeout();
            stopHoldGesture(this);
            this.inPause = false;
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_CANCEL, evt);
            this.gotoState(STATE_0CLICK);
        }
    };
    onMouseDown[STATE_1DOWN] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        var id = 'mouse' + (evt.which || 0);
        addMouseFinger(this, id, evt);
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_MOUSE_DOWN, evt);
    };
    onMouseMove[STATE_1DOWN] = function (evt) {
        // Analyse
        if (this.inPause) {
            this.clearTimeout();
            stopHoldGesture(this);
            this.inPause = false;
        }
        var id = 'mouse' + (evt.which || 0);
        if (hasFinger(this, id)) {
            this.evtHandled = true;
            setMouseFinger(this, id, evt);
            if (this.finger1.id == id) {
                addSourcePoint(this);
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_MOVE, evt);
            startGestureIfMoves(this);
        }
    };
    onMouseUp[STATE_1DOWN] = function (evt) {
        // Analyse
        if (this.inPause) {
            this.clearTimeout();
            stopHoldGesture(this);
            this.inPause = false;
        }
        var id = 'mouse' + (evt.which || 0);
        if (removeFinger(this, id)) {
            this.evtHandled = true;
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_UP, evt);
            var onEventName = onWhichEvent(this, GST_DOUBLE_TAP, evt.nbFinger);
            if (onEventName.length > 0) {
                this.gotoState(STATE_1CLICK);
            } else {
                tapGesture(this);
                this.gotoState(STATE_0CLICK);
            }
        }
    };

    // 1CLICK state waits for all fingers be UP before starting a new gesture
    onEnter[STATE_1CLICK] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onEnter');
        this.startTimer(this.options.doubleTime);
    };
    onExit[STATE_1CLICK] = function () {
        this.clearTimeout();
    };
    onTimeout[STATE_1CLICK] = function () {
        tapGesture(this);
        this.gotoState(STATE_0CLICK);
    };
    onTouchStart[STATE_1CLICK] = function (evt) {
        // Analyse
        if (this.fingers.length <= 0) {
            this.evtHandled = true;
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var finger = evt.changedTouches[i];
                var id = finger.identifier;
                addTouchFinger(this, id, finger);
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_START, evt);
            this.gotoState(STATE_2DOWN);
        }
    };
    onTouchMove[STATE_1CLICK] = function (evt) {
    };
    onTouchEnd[STATE_1CLICK] = function (evt) {
        // Analyse
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_END, evt);
        }
    };
    onTouchCancel[STATE_1CLICK] = function (evt) {
        // Analyse
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_CANCEL, evt);
        }
    };
    onMouseDown[STATE_1CLICK] = function (evt) {
        // Analyse
        if (this.fingers.length <= 0) {
            this.evtHandled = true;
            var id = 'mouse' + (evt.which || 0);
            addMouseFinger(this, id, evt);
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_DOWN, evt);
            this.gotoState(STATE_2DOWN);
        }
    };
    onMouseMove[STATE_1CLICK] = function (evt) {
    };
    onMouseUp[STATE_1CLICK] = function (evt) {
        // Analyse
        var id = 'mouse' + (evt.which || 0);
        if (removeFinger(this, id)) {
            this.evtHandled = true;
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_UP, evt);
        }
    };

    onEnter[STATE_2DOWN] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onEnter');
    };
    onExit[STATE_2DOWN] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onExit');
    };
    onTimeout[STATE_2DOWN] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onTimeout');
    };
    onTouchStart[STATE_2DOWN] = function (evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onTouchStart');
        // Analyse
        this.evtHandled = true;
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            addTouchFinger(this, id, finger);
        }
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_TOUCH_START, evt);
    };
    onTouchMove[STATE_2DOWN] = function (evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onTouchMove');
        // Analyse
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (hasFinger(this, id)) {
                this.evtHandled = true;
                setTouchFinger(this, id, finger);
                if (this.finger1.id == id) {
                    addSourcePoint(this);
                }
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_MOVE, evt);
            tapAndStartGestureIfMoves(this);
        }
    };
    onTouchEnd[STATE_2DOWN] = function (evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onTouchEnd');
        // Analyse
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        // Validate GESTURE as soon as ONE finger is UP
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_END, evt);
            this.triggerEvent(GST_DOUBLE_TAP, {
                clientX: this.finger1.clientX,
                clientY: this.finger1.clientY,
                pageX: this.finger1.pageX,
                pageY: this.finger1.pageY,
                nbFinger: this.fingers.length
            });
            this.gotoState(STATE_0CLICK);
        }
    };
    onTouchCancel[STATE_2DOWN] = function (evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onTouchCancel');
        // Analyse
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_CANCEL, evt);
            tapGesture(this);
            this.gotoState(STATE_0CLICK);
        }
    };
    onMouseDown[STATE_2DOWN] = function (evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onMouseDown');
        // Analyse
        this.evtHandled = true;
        var id = 'mouse' + (evt.which || 0);
        addMouseFinger(this, id, evt);
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_MOUSE_DOWN, evt);
    };
    onMouseMove[STATE_2DOWN] = function (evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onMouseMove');
        // Analyse
        var id = 'mouse' + (evt.which || 0);
        if (hasFinger(this, id)) {
            this.evtHandled = true;
            setMouseFinger(this, id, evt);
            if (this.finger1.id == id) {
                addSourcePoint(this);
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_MOVE, evt);
            tapAndStartGestureIfMoves(this);
        }
    };
    onMouseUp[STATE_2DOWN] = function (evt) {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onMouseUp');
        // Analyse
        var id = 'mouse' + (evt.which || 0);
        if (removeFinger(this, id)) {
            this.evtHandled = true;
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_UP, evt);
            this.triggerEvent(GST_DOUBLE_TAP, {
                clientX: this.finger1.clientX,
                clientY: this.finger1.clientY,
                pageX: this.finger1.pageX,
                pageY: this.finger1.pageY,
                nbFinger: this.fingers.length
            });
            this.gotoState(STATE_0CLICK);
        }
    };

    onEnter[STATE_SWIPING] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onEnter');
        this.inPause = false;
        this.startTimer(this.options.holdTime);
    };
    onExit[STATE_SWIPING] = function () {
        this.clearTimeout();
    };
    onTimeout[STATE_SWIPING] = function () {
        this.triggerEvent(GST_SWIPE_PAUSE, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length,
            side: this.side,
            moves: this.moves,
            sourcePoints: this.sourcePoints,
            timeStamp: this.timeStamp
        });
        this.inPause = true;
    };
    onTouchStart[STATE_SWIPING] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            addTouchFinger(this, id, finger);
        }
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_TOUCH_START, evt);
    };
    onTouchMove[STATE_SWIPING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (hasFinger(this, id)) {
                this.evtHandled = true;
                setTouchFinger(this, id, finger);
                if (this.finger1.id == id) {
                    addSourcePoint(this);
                }
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_MOVE, evt);
            continueSwipeGesture(this);
        }
    };
    onTouchEnd[STATE_SWIPING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        // Validate GESTURE as soon as ONE finger is UP
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_END, evt);
            endSwipeGesture(this);
        }
    };
    onTouchCancel[STATE_SWIPING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_CANCEL, evt);
            cancelSwipeGesture(this);
        }
    };
    onMouseDown[STATE_SWIPING] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        var id = 'mouse' + (evt.which || 0);
        addMouseFinger(this, id, evt);
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_MOUSE_DOWN, evt);
    };
    onMouseMove[STATE_SWIPING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        var id = 'mouse' + (evt.which || 0);
        if (hasFinger(this, id)) {
            this.evtHandled = true;
            setMouseFinger(this, id, evt);
            if (this.finger1.id == id) {
                addSourcePoint(this);
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_MOVE, evt);
            continueSwipeGesture(this);
        }
    };
    onMouseUp[STATE_SWIPING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        var id = 'mouse' + (evt.which || 0);
        if (removeFinger(this, id)) {
            this.evtHandled = true;
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_UP, evt);
            endSwipeGesture(this);
        }
    };

    onEnter[STATE_SCROLLING] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onEnter');
        this.inPause = false;
        this.startTimer(this.options.holdTime);
    };
    onExit[STATE_SCROLLING] = function () {
        this.clearTimeout();
    };
    onTimeout[STATE_SCROLLING] = function () {
        this.triggerEvent(GST_SCROLL_PAUSE, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length,
            side: this.side,
            moves: this.moves,
            sourcePoints: this.sourcePoints,
            timeStamp: this.timeStamp
        });
        this.inPause = true;
    };
    onTouchStart[STATE_SCROLLING] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            addTouchFinger(this, id, finger);
        }
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_TOUCH_START, evt);
    };
    onTouchMove[STATE_SCROLLING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (hasFinger(this, id)) {
                this.evtHandled = true;
                setTouchFinger(this, id, finger);
                if (this.finger1.id == id) {
                    addSourcePoint(this);
                }
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_MOVE, evt);
            continueScrollGesture(this);
        }
    };
    onTouchEnd[STATE_SCROLLING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        // Validate GESTURE as soon as ONE finger is UP
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_END, evt);
            endScrollGesture(this);
        }
    };
    onTouchCancel[STATE_SCROLLING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_CANCEL, evt);
            cancelScrollGesture(this);
        }
    };
    onMouseDown[STATE_SCROLLING] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        var id = 'mouse' + (evt.which || 0);
        addMouseFinger(this, id, evt);
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_MOUSE_DOWN, evt);
    };
    onMouseMove[STATE_SCROLLING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        var id = 'mouse' + (evt.which || 0);
        if (hasFinger(this, id)) {
            this.evtHandled = true;
            setMouseFinger(this, id, evt);
            if (this.finger1.id == id) {
                addSourcePoint(this);
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_MOVE, evt);
            continueScrollGesture(this);
        }
    };
    onMouseUp[STATE_SCROLLING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        var id = 'mouse' + (evt.which || 0);
        if (removeFinger(this, id)) {
            this.evtHandled = true;
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_UP, evt);
            endScrollGesture(this);
        }
    };

    onEnter[STATE_DRAGGING] = function () {
        //a4p.InternalLog.log('a4p.Sense ' + sense.name + ' ' + sense.state, 'onEnter');
        clearDrops(this);
        this.inPause = false;
        this.startTimer(this.options.holdTime);
    };
    onExit[STATE_DRAGGING] = function () {
        this.clearTimeout();
    };
    onTimeout[STATE_DRAGGING] = function () {
        this.triggerEvent(GST_DRAG_PAUSE, {
            clientX: this.finger1.clientX,
            clientY: this.finger1.clientY,
            pageX: this.finger1.pageX,
            pageY: this.finger1.pageY,
            nbFinger: this.fingers.length,
            side: this.side,
            moves: this.moves,
            sourcePoints: this.sourcePoints,
            timeStamp: this.timeStamp
        });
        this.inPause = true;
    };
    onTouchStart[STATE_DRAGGING] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            addTouchFinger(this, id, finger);
        }
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_TOUCH_START, evt);
    };
    onTouchMove[STATE_DRAGGING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (hasFinger(this, id)) {
                this.evtHandled = true;
                setTouchFinger(this, id, finger);
                if (this.finger1.id == id) {
                    addSourcePoint(this);
                }
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_MOVE, evt);
            continueDragGesture(this);
        }
    };
    onTouchEnd[STATE_DRAGGING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (hasFinger(this, id)) {
                this.evtHandled = true;
                break;
            }
        }
        // Trigger
        // Validate GESTURE as soon as ONE finger is UP
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_END, evt);
            dropStart(this);
            dropEnd(this);
            this.gotoState(STATE_0CLICK);
        }
    };
    onTouchCancel[STATE_DRAGGING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        for (var i = 0; i < evt.changedTouches.length; i++) {
            var finger = evt.changedTouches[i];
            var id = finger.identifier;
            if (removeFinger(this, id)) {
                this.evtHandled = true;
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_TOUCH_CANCEL, evt);
            dropCancel(this);
            this.gotoState(STATE_0CLICK);
        }
    };
    onMouseDown[STATE_DRAGGING] = function (evt) {
        // Analyse
        this.evtHandled = true;
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        var id = 'mouse' + (evt.which || 0);
        addMouseFinger(this, id, evt);
        // Trigger
        evt.nbFinger = this.fingers.length;
        this.triggerEvent(EVT_MOUSE_DOWN, evt);
    };
    onMouseMove[STATE_DRAGGING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.startTimer(this.options.holdTime);
        }
        var id = 'mouse' + (evt.which || 0);
        if (hasFinger(this, id)) {
            this.evtHandled = true;
            setMouseFinger(this, id, evt);
            if (this.finger1.id == id) {
                addSourcePoint(this);
            }
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_MOVE, evt);
            continueDragGesture(this);
        }
    };
    onMouseUp[STATE_DRAGGING] = function (evt) {
        // Analyse
        if (!this.inPause) {
            this.clearTimeout();
        }
        var id = 'mouse' + (evt.which || 0);
        if (hasFinger(this, id)) {
            this.evtHandled = true;
        }
        // Trigger
        if (this.evtHandled) {
            evt.nbFinger = this.fingers.length;
            this.triggerEvent(EVT_MOUSE_UP, evt);
            dropStart(this);
            dropEnd(this);
            this.gotoState(STATE_0CLICK);
        }
    };

    return Sense;
})(navigator, window, document);



// Namespace miapp
var miapp;
if (!miapp) miapp = {};

/**
 *
 *  Secure Hash Algorithm (SHA1)
 *  http://www.webtoolkit.info/
 *
 **/
miapp.Sha1 = (function () {
'use strict';

    var Sha1 = {};

    // Public API

    /**
     * Hash string
     */
    Sha1.hash = function (input) {
        var s = miapp.Utf8.encode(input);
        return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
    };

    /**
     * Create a 256 bits key from a password
     */
    Sha1.key256 = function (password) {
        var nBytes = 256 / 8;  // no bytes in key
        var halfLen = password.length / 2;
        var hash1 = miapp.Sha1.hash(password.substr(0, halfLen));
        var hash2 = miapp.Sha1.hash(password.substr(halfLen));
        return hash1.substr(0, 16) + hash2.substr(0, nBytes - 16);  // expand key to 16/24/32 bytes long
    };

    /*
     * Convert a raw string to an array of big-endian words
     * Characters >255 have their high-byte silently ignored.
     */
    function rstr2binb(input) {
        var output = new Array(input.length >> 2);
        for (var i = 0; i < output.length; i++)
            output[i] = 0;
        for (var j = 0; j < input.length * 8; j += 8)
            output[j >> 5] |= (input.charCodeAt(j / 8) & 0xFF) << (24 - j % 32);
        return output;
    }

    /*
     * Convert an array of big-endian words to a string
     */
    function binb2rstr(input) {
        var output = "";
        for (var i = 0; i < input.length * 32; i += 8)
            output += String.fromCharCode((input[i >> 5] >>> (24 - i % 32)) & 0xFF);
        return output;
    }

    /*
     * Calculate the SHA-1 of an array of big-endian words, and a bit length
     */
    function binb_sha1(x, len) {
        /* append padding */
        x[len >> 5] |= 0x80 << (24 - len % 32);
        x[((len + 64 >> 9) << 4) + 15] = len;

        var w = new Array(80);
        var a = 1732584193;
        var b = -271733879;
        var c = -1732584194;
        var d = 271733878;
        var e = -1009589776;

        for (var i = 0; i < x.length; i += 16) {
            var olda = a;
            var oldb = b;
            var oldc = c;
            var oldd = d;
            var olde = e;

            for (var j = 0; j < 80; j++) {
                if (j < 16) w[j] = x[i + j];
                else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                    safe_add(safe_add(e, w[j]), sha1_kt(j)));
                e = d;
                d = c;
                c = bit_rol(b, 30);
                b = a;
                a = t;
            }

            a = safe_add(a, olda);
            b = safe_add(b, oldb);
            c = safe_add(c, oldc);
            d = safe_add(d, oldd);
            e = safe_add(e, olde);
        }
        return [a, b, c, d, e];

    }

    /*
     * Perform the appropriate triplet combination function for the current
     * iteration
     */
    function sha1_ft(t, b, c, d) {
        if (t < 20) return (b & c) | ((~b) & d);
        if (t < 40) return b ^ c ^ d;
        if (t < 60) return (b & c) | (b & d) | (c & d);
        return b ^ c ^ d;
    }

    /*
     * Determine the appropriate additive constant for the current iteration
     */
    function sha1_kt(t) {
        return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
            (t < 60) ? -1894007588 : -899497514;
    }

    /*
     * Add integers, wrapping at 2^32. This uses 16-bit operations internally
     * to work around bugs in some JS interpreters.
     */
    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    /*
     * Bitwise rotate a 32-bit number to the left.
     */
    function bit_rol(num, cnt) {
        return (num << cnt) | (num >>> (32 - cnt));
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Sha1;
})(); // Invoke the function immediately to create this class.

var miapp;
if (!miapp) miapp = {};


/*
Pour recopier un fichier externe au navigateur dans le localStorage ou le fileStorage, il faut passer par <input type="file"/>
Exemple :

<!--<input id="file" type="file" multiple />-->
<!-- multiple does not work on Android -->
<input id="file" type="file" />
<div id="prev"></div>

<script>
var fileInput = document.querySelector('#file');
var prev = document.querySelector('#prev');

fileInput.onchange = function() {

    var files = this.files;
    var filesLen = files.length;
    var allowedTypes = ['png', 'jpg', 'jpeg', 'gif']

    for (var i = 0 ; i < filesLen ; i++) {
        var reader = new FileReader();
        // Lecture du contenu de fichier
        reader.onload = function() {
            alert('Contenu du fichier "' + fileInput.files[i].name + '" :\n\n' + reader.result);
        };
        reader.readAsText(files[i]);

        // Previsualisation de fichier image
        var fileNames = files[i].name.split('.');
        var fileExt = fileNames[fileNames.length - 1];
        if (allowedTypes.indexOf(fileExt) != -1) {
            var reader = new FileReader();
            reader.onload = function() {
                var imgElement = document.createElement('img');
                imgElement.style.maxWidth = '150px';
                imgElement.style.maxHeight = '150px';
                imgElement.src = this.result;
                prev.appendChild(imgElement);
            };
            reader.readAsDataURL(files[i]);
        }
    }
};
</script>

 */

// Create a new module
/*angular.module("miapp", [
    "miapp.all",
    "miapp.file",
    "miapp.analytics",
    "miapp.storage",
    "miapp.stringFormat",
    "miapp.base64",
    "miapp.json",
    "miapp.xml",
    "miapp.fileDownloader",
    "miapp.fileUploader",
    "miapp.taskReceiver",
    "miapp.taskSender",
    "miapp.sense"
]);*/

// Create a new module
//var miappStorageModule = angular.module('miapp.storage', ['miapp.xml', 'miapp.json']);

/**
 * localStorage service provides an interface to manage in memory data repository.
 * @param {object} storageService The object window.localStorage or an equivalent object which implements it.
 */
/*miappStorageModule.factory('localStorage', ['miappXml', 'miappJson', function(miappXml, miappJson) {
    var LocalStorage = function(storageService) {
        storageService = storageService || window.localStorage;
    };
    return LocalStorage;
}]);*/


/**
 * Memory storage (used mainly for tests).
 * Usage : miapp.LocalStorageFactory(new miapp.MemoryStorage());
 */
miapp.MemoryStorage = (function () {
"use strict";

    function Storage() {
        this.keyes = [];
        this.set = {};
        this.length = 0;
    }
    Storage.prototype.clear = function () {
        this.keyes = [];
        this.set = {};
        this.length = 0;
    };
    Storage.prototype.key = function (idx) {
        return this.keyes[idx];
    };
    Storage.prototype.getItem = function (key) {
        if (miapp.isUndefined(this.set[key])) return null;
        return this.set[key];
    };
    Storage.prototype.setItem = function (key, value) {
        this.set[key] = value;
        for (var i = 0; i < this.keyes.length; i++) {
            if (this.keyes[i] == key) return;
        }
        this.keyes.push(key);
        this.length = this.keyes.length;
    };
    Storage.prototype.removeItem = function (key) {
        delete this.set[key];
        for (var i = 0; i < this.keyes.length; i++) {
            if (this.keyes[i] == key) {
                this.keyes.splice(i, 1);
                this.length = this.keyes.length;
            }
        }
    };
    return Storage;
})();

/**
 * localStorage class factory
 * Usage : var LocalStorage = miapp.LocalStorageFactory(window.localStorage); // to create a new class
 * Usage : var localStorageService = new LocalStorage(); // to create a new instance
 */
miapp.LocalStorageFactory = function (storageService) {
"use strict";

    var storage = storageService || window.localStorage;
    if (!storage) {
        throw new Error("miapp.LocalStorageFactory needs a storageService!");
    }

    // Constructor
    function LocalStorage() {
        this.version = "0.1";
        if (!miapp.Xml) {
            throw new Error("miapp.Xml needs to be loaded before miapp.LocalStorage!");
        }
        if (!miapp.Json) {
            throw new Error("miapp.Json needs to be loaded before miapp.LocalStorage!");
        }
        if (!miapp.Xml.isXml || !miapp.Xml.xml2String || !miapp.Xml.string2Xml) {
            throw new Error("miapp.Xml with isXml(), xml2String() and string2Xml() needs to be loaded before miapp.LocalStorage!");
        }
        if (!miapp.Json.object2String || !miapp.Json.string2Object) {
            throw new Error("miapp.Json with object2String() and string2Object() needs to be loaded before miapp.LocalStorage!");
        }
    }

    // Public API

    /**
     * Sets a key's value.
     *
     * @param {String} key - Key to set. If this value is not set or not
     *              a string an exception is raised.
     * @param {Mixed} value - Value to set. This can be any value that is JSON
     *              compatible (Numbers, Strings, Objects etc.).
     * @returns the stored value which is a container of user value.
     */
    LocalStorage.prototype.set = function (key, value) {
        checkKey(key);
        // clone the object before saving to storage
        var t = typeof(value);
        if (t == "undefined")
            value = 'null';
        else if (value === null)
            value = 'null';
        else if (miapp.Xml.isXml(value))
            value = miapp.Json.object2String({xml:miapp.Xml.xml2String(value)});
        else if (t == "string")
            value = miapp.Json.object2String({string:value});
        else if (t == "number")
            value = miapp.Json.object2String({number:value});
        else if (t == "boolean")
            value = miapp.Json.object2String({ bool : value });
        else if (t == "object")
            value = miapp.Json.object2String( { json : value } );
        else {
            // reject and do not insert
            // if (typeof value == "function") for example
            throw new TypeError('Value type ' + t + ' is invalid. It must be null, undefined, xml, string, number, boolean or object');
        }
        storage.setItem(key, value);
        return value;
    };

    /**
     * Looks up a key in cache
     *
     * @param {String} key - Key to look up.
     * @param {mixed} def - Default value to return, if key didn't exist.
     * @returns the key value, default value or <null>
     */
    LocalStorage.prototype.get = function (key, def) {
        checkKey(key);
        var item = storage.getItem(key);
        if (item !== null) {
            if (item == 'null') {
                return null;
            }
            var value = miapp.Json.string2Object(item);
            if ('xml' in value) {
                return miapp.Xml.string2Xml(value.xml);
            } else if ('string' in value) {
                return value.string;
            } else if ('number' in value) {
                return value.number.valueOf();
            } else if ('bool' in value) {
                return value.bool.valueOf();
            } else {
                return value.json;
            }
        }
        return miapp.isUndefined(def) ? null : def;
    };

    /**
     * Deletes a key from cache.
     *
     * @param {String} key - Key to delete.
     * @returns true if key existed or false if it didn't
     */
    LocalStorage.prototype.remove = function (key) {
        checkKey(key);
        var existed = (storage.getItem(key) !== null);
        storage.removeItem(key);
        return existed;
    };

    /**
     * Deletes everything in cache.
     *
     * @return true
     */
    LocalStorage.prototype.clear = function () {
        var existed = (storage.length > 0);
        storage.clear();
        return existed;
    };

    /**
     * How much space in bytes does the storage take?
     *
     * @returns Number
     */
    LocalStorage.prototype.size = function () {
        return storage.length;
    };

    /**
     * Call function f on the specified context for each element of the storage
     * from index 0 to index length-1.
     * WARNING : You should not modify the storage during the loop !!!
     *
     * @param {Function} f - Function to call on every item.
     * @param {Object} context - Context (this for example).
     * @returns Number of items in storage
     */
    LocalStorage.prototype.foreach = function (f, context) {
        var n = storage.length;
        for (var i = 0; i < n; i++) {
            var key = storage.key(i);
            var value = this.get(key);
            if (context) {
                // f is an instance method on instance context
                f.call(context, value);
            } else {
                // f is a function or class method
                f(value);
            }
        }
        return n;
    };

    // Private API
    // helper functions and variables hidden within this function scope

    function checkKey(key) {
        if (!key || (typeof key != "string")) {
            throw new TypeError('Key type must be string');
        }
        return true;
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return LocalStorage;
};

miapp.FileStorage = (function () {
    "use strict";

    // Constructor
    function FileStorage($q, $rootScope) {
        this.version = "0.1";
        this.q = $q;
        this.rootScope = $rootScope;
        this.grantedBytes = 0;
        this.fs = null;
        this.urlPrefix = '';
        this.storageType = null;

        this.initDone = false;
        this.initPromises = [];
        this.initTimer = null;
    }

    // Public API

    function initEnd(self) {
        miapp.safeApply(self.rootScope, function() {
            for (var i= 0; i < self.initPromises.length; i++) {
                self.initTrigger(self.initPromises[i]);
            }
            self.initDone = true;
            self.initPromises = [];
            self.initTimer = null;
        });
    }

    function launchEnd(self) {
        if (self.initTimer === null) {
            self.initTimer = setTimeout(function() { initEnd(self); }, 100);
        }
    }

    function tryQuota(self, grantBytes) {
        try {
            var fctOnSuccess = function (fs) {
                //miapp.InternalLog.log('miapp.FileStorage', 'opened file system ' + fs.name);
                self.fs = fs;
                self.urlPrefix = '';
                var pattern = /^(https?)_([^_]+)_(\d+):Persistent$/;
                if (pattern.test(fs.name)) {
                    var name = fs.name;
                    name = name.replace(pattern, "$1://$2:$3");// remove ':Persistent' and '_'
                    name = name.replace(/^(.*):0$/, "$1");// remove ':0'
                    // Specific to Chrome where window.webkitResolveLocalFileSystemURI does not exist
                    // get URL from URI by prefixing fullPath with urlPrefix
                    self.urlPrefix = 'filesystem:' + name + '/persistent';
                }
                //miapp.InternalLog.log('miapp.FileStorage', 'urlPrefix = ' + self.urlPrefix);
                self.initTrigger = function(deferred) { deferred.resolve(); };
                launchEnd(self);
            };
            var fctOnFailure = function (fileError) {
                if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) {
                    setTimeout(function() { tryQuota(self, grantBytes/2); }, 100);
                } else {
                    var message = "requestFileSystem failure : " + errorMessage(fileError);
                    self.initTrigger = function(deferred) { deferred.reject(message); };
                    launchEnd(self);
                }
            };
            var requestFs = function(grantedBytes) {
                try {
                    if (miapp.isDefined(window.requestFileSystem)) {
                        window.requestFileSystem(self.storageType, grantedBytes, fctOnSuccess, fctOnFailure);
                    } else {
                        window.webkitRequestFileSystem(self.storageType, grantedBytes, fctOnSuccess, fctOnFailure);
                    }
                } catch (e) {
                    var message = e.message;
                    self.initTrigger = function(deferred) { deferred.reject(message); };
                    launchEnd(self);
                }
            };

            if (miapp.isDefined(window.webkitPersistentStorage)) {
                // In Chrome 27+
                if (miapp.isDefined(window.webkitPersistentStorage.requestQuota)) {
                    window.webkitPersistentStorage.requestQuota(grantBytes, function (grantedBytes) {
                        self.grantedBytes = grantedBytes;
                        requestFs(grantedBytes);
                    }, function (fileError) {
                        if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) {
                            setTimeout(function() { tryQuota(self, grantBytes/2); }, 100);
                        } else {
                            var message = "requestQuota failure : " + errorMessage(fileError);
                            self.initTrigger = function(deferred) { deferred.reject(message); };
                            launchEnd(self);
                        }
                    });
                } else {
                    requestFs(grantBytes);
                }
            } else if (miapp.isDefined(navigator.webkitPersistentStorage)){//MLE deprecated ? (miapp.isDefined(window.webkitStorageInfo)) {
                // In Chrome 13
                if (miapp.isDefined(navigator.webkitPersistentStorage.requestQuota)) {
                    navigator.webkitPersistentStorage.requestQuota(self.storageType, grantBytes, function (grantedBytes) {
                        self.grantedBytes = grantedBytes;
                        requestFs(grantedBytes);
                    }, function (fileError) {
                        if (fileError.code == FileError.QUOTA_EXCEEDED_ERR) {
                            setTimeout(function() { tryQuota(self, grantBytes/2); }, 100);
                        } else {
                            var message = "requestQuota failure : " + errorMessage(fileError);
                            self.initTrigger = function(deferred) { deferred.reject(message); };
                            launchEnd(self);
                        }
                    });
                } else {
                    requestFs(grantBytes);
                }
            } else {
                requestFs(grantBytes);
            }
        } catch (e) {
            var message = e.message;
            self.initTrigger = function(deferred) { deferred.reject(message); };
            launchEnd(self);
        }
    }

    FileStorage.prototype.init = function () {
        var deferred = this.q.defer();
        this.initPromises.push(deferred);
        var message;
        if (this.initDone) {
            // Init already finished
            launchEnd(this);
        } else if (this.initPromises.length == 1) {
            // Init not yet started
            this.initPromises.push(deferred);
            if (miapp.isUndefinedOrNull(LocalFileSystem)) {
                this.storageType = window.PERSISTENT;
            } else {
                this.storageType = LocalFileSystem.PERSISTENT;
            }
            if (!window.File || !window.FileReader || !window.Blob) {
                message = "window.File, window.FileReader and window.Blob need to be loaded before miapp.FileStorage!";
                this.initTrigger = function(deferred) { deferred.reject(message); };
                launchEnd(this);
            } else if (miapp.isUndefined(window.requestFileSystem) && miapp.isUndefined(window.webkitRequestFileSystem)) {
                message = "window.requestFileSystem() or window.webkitRequestFileSystem() required by miapp.FileStorage!";
                this.initTrigger = function(deferred) { deferred.reject(message); };
                launchEnd(this);
            } else if (miapp.isUndefined(window.resolveLocalFileSystemURL) &&
                miapp.isUndefined(window.webkitResolveLocalFileSystemURL) &&
                miapp.isUndefined(window.resolveLocalFileSystemURI) &&
                miapp.isUndefined(window.webkitResolveLocalFileSystemURI)) {
                message = "window.resolveLocalFileSystemURI or equivalent required by miapp.FileStorage!";
                this.initTrigger = function(deferred) { deferred.reject(message); };
                launchEnd(this);
            } else {
                var grantBytes = 4 * 1024 * 1024 * 1024;
                var self = this;
                setTimeout(function() { tryQuota(self, grantBytes); }, 100);
            }
        } else {
            // Init already started but not yet finished
        }
        return deferred.promise;
    };

    /**
     * Get granted space.
     *
     * @param {Int} storageType - LocalFileSystem.TEMPORARY or LocalFileSystem.PERSISTENT or window.TEMPORARY or window.PERSISTENT value.
     * @param {Function} onSuccess - Callback function with long long argument giving grantedQuotaInBytes or 0 if not available.
     * @returns true.
     */
    /* getGrantedBytes() and getUsedBytes() are not yet ready
     FileStorage.getGrantedBytes = function (storageType, onSuccess) {
     // In Chrome 13
            if ((miapp.isUndefinedOrNull(storageType)) {
                if (miapp.isUndefinedOrNull(LocalFileSystem)) {
                    storageType = window.PERSISTENT;
                } else {
                    storageType = LocalFileSystem.PERSISTENT;
                }
            }
     if (miapp.isUndefined(navigator.webkitPersistentStorage)) {
     if (miapp.isUndefined(navigator.webkitPersistentStorage.queryUsageAndQuota)) {
     navigator.webkitPersistentStorage.queryUsageAndQuota(storageType,
     function (currentUsageInBytes) {
     },
     function (grantedQuotaInBytes) {
     onSuccess(grantedQuotaInBytes);
     });
     return true;
     }
     }
     onSuccess(0);
     return true;
     };
     */

    /**
     * Get used space.
     *
     * @param {Int} storageType - LocalFileSystem.TEMPORARY or LocalFileSystem.PERSISTENT or window.TEMPORARY or window.PERSISTENT value.
     * @param {Function} onSuccess - Callback function with long long argument giving currentUsageInBytes or 0 if not available.
     * @returns true.
     */
    /* getGrantedBytes() and getUsedBytes() are not yet ready
     FileStorage.getUsedBytes = function (storageType, onSuccess) {
     // In Chrome 13
            if (miapp.isUndefinedOrNull(storageType)) {
                if (miapp.isUndefinedOrNull(LocalFileSystem)) {
                    storageType = window.PERSISTENT;
                } else {
                    storageType = LocalFileSystem.PERSISTENT;
                }
            }
     if (miapp.isDefined(navigator.webkitPersistentStorage)) {
     if (miapp.isDefined(navigator.webkitPersistentStorage.queryUsageAndQuota)) {
     navigator.webkitPersistentStorage.queryUsageAndQuota(storageType,
     function (currentUsageInBytes) {
     onSuccess(currentUsageInBytes);
     },
     function (grantedQuotaInBytes) {
     });
     return true;
     }
     }
     onSuccess(0);
     return true;
     };
     */


    /**
     * get FileSystem ... usefull ? prefer using inside
     */
    FileStorage.prototype.getFS = function () {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        return this.fs;
    };

    /**
     * Create a directory in root directory.
     *
     * @param {String} dirPath - Directory path (relative or absolute). All directories in path will be created.
     * @param {Function} onSuccess - Called with dirEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.createDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var self = this;
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                if (onSuccess) {
                    onSuccess(dirEntry);
                }
            }, onFailure);

    };

    /**
     * Get a directory in root directory.
     * Will get nothing if directory does not already exist.
     *
     * @param {String} dirPath - Directory path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with dirEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs, onSuccess, onFailure);
    };

    /**
     * Read the content of a directory.
     * Will get nothing if directory does not already exist.
     *
     * @param {String} dirPath - Directory path (relative or absolute). Its parent directories must already exist.
     * @param {Function} onSuccess - Called with dirNames and fileNames sorted Array arguments if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.readDirectory = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        var dirContentReader = function (dirEntry) {
            var dirReader = dirEntry.createReader();
            var fileEntries = [];
            var dirEntries = [];
            // There is no guarantee that all entries are read in ony one call to readEntries()
            // call readEntries() until no more results are returned
            var readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (!results.length) {
                        // All entries have been read
                        if (onSuccess) {
                            dirEntries.sort();
                            fileEntries.sort();
                            onSuccess(dirEntries, fileEntries);
                        }
                    } else {
                        // New entries to add
                        var max = results.length;
                        for (var i = 0; i < max; i++) {
                            if (results[i].isFile) {
                                //fileEntries.push(results[i].fullPath);
                                fileEntries.push(results[i].name);
                            } else {
                                //dirEntries.push(results[i].fullPath);
                                dirEntries.push(results[i].name);
                            }
                        }
                        readEntries();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("readEntries from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            };
            // Start to read entries
            readEntries();
        };
        getDirEntry(this.fs.root, dirOptions, dirs, dirContentReader, onFailure);
    };

    /**
     * Read the content of a directory and all its subdirectories.
     * Will get nothing if directory does not already exist.
     *
     * @param {String} dirPath - Directory path (relative or absolute). Its parent directories must already exist.
     * @param {Function} onSuccess - Called with fileFullPaths sorted Array argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.readFullDirectory = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        var dirEntries = [];
        var fileEntries = [];
        var dirContentReader = function (dirEntry) {
            //miapp.InternalLog.log('miapp.FileStorage', 'Reading dir ' + dirEntry.fullPath);
            var dirReader = dirEntry.createReader();
            // There is no guarantee that all entries are read in ony one call to readEntries()
            // call readEntries() until no more results are returned
            var readEntries = function () {
                dirReader.readEntries(function (results) {
                    if (!results.length) {
                        // All entries of this dirEntry have been read
                        if (dirEntries.length <= 0) {
                            // All entries of all dirEntries have been read
                            if (onSuccess) {
                                fileEntries.sort();
                                onSuccess(fileEntries);
                            }
                        } else {
                            dirContentReader(dirEntries.shift());
                        }
                    } else {
                        // New entries to add
                        var max = results.length;
                        for (var i = 0; i < max; i++) {
                            if (results[i].isFile) {
                                fileEntries.push(results[i].fullPath);
                            } else {
                                dirEntries.push(results[i]);
                            }
                        }
                        readEntries();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("readEntries from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            };
            // Start to read entries
            readEntries();
        };
        getDirEntry(this.fs.root, dirOptions, dirs, dirContentReader, onFailure);
    };

    FileStorage.prototype.deleteDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                dirEntry.remove(function () {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("remove " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, function(message) {
                // Ignore error if dir unknown. It is also a success
                if (onSuccess) {
                    onSuccess();
                }
            });
    };

    FileStorage.prototype.deleteFullDir = function (dirPath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var names = dirPath.split('/');
        var max = names.length;
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:false, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                dirEntry.removeRecursively(function () {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("removeRecursively " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, function (message) {
                // Ignore error if dir unknown. It is also a success
                if (onSuccess) {
                    onSuccess();
                }
            });
    };

    /**
     * Get a fileEntry from its URL.
     * Will get nothing if file does not already exist.
     *
     * @param {String} fileUrl - File URL.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getFileFromUrl = function (fileUrl, onSuccess, onFailure) {
        //miapp.InternalLog.log('miapp.FileStorage','getFileFromUrl : '+ fileUrl);
        if (!this.fs) {
            //miapp.InternalLog.log('miapp.FileStorage','FileStorage No FS !');
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        // resolve File in private or localhost fs
        fileUrl = fileUrl.replace('/private/','/');
        fileUrl = fileUrl.replace('/localhost/','/');

        if (miapp.isDefined(window.resolveLocalFileSystemURL)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.resolveLocalFileSystemURL '+fileUrl);
            window.resolveLocalFileSystemURL(fileUrl, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("resolveLocalFileSystemURL " + fileUrl + " failure : " + errorMessage(fileError));
                    }
                });
        } else if (miapp.isDefined(window.webkitResolveLocalFileSystemURL)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.webkitResolveLocalFileSystemURL '+fileUrl);
            window.webkitResolveLocalFileSystemURL(fileUrl, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("webkitResolveLocalFileSystemURL " + fileUrl + " failure : " + errorMessage(fileError));
                    }
                });
        }
        else {
            //miapp.InternalLog.log('miapp.FileStorage','cordova.getFileFromUri '+fileUrl);
            // In Cordova window.webkitResolveLocalFileSystemURL does not exist
            this.getFileFromUri(fileUrl, onSuccess, onFailure);
        }
    };

    /**
     * Get a fileEntry from its URI.
     * Will get nothing if file does not already exist.
     *
     * @param {String} fileUri - File URI.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getFileFromUri = function (fileUri, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        // resolve File in private or localhost fs
        fileUri = fileUri.replace('/private/','/');
        fileUri = fileUri.replace('/localhost/','/');

        if (miapp.isDefined(window.resolveLocalFileSystemURI)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.resolveLocalFileSystemURI '+fileUri);
            window.resolveLocalFileSystemURI(fileUri, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("resolveLocalFileSystemURI " + fileUri + " failure : " + errorMessage(fileError));
                    }
                });
        } else if (miapp.isDefined(window.webkitResolveLocalFileSystemURI)) {
            //miapp.InternalLog.log('miapp.FileStorage','window.webkitResolveLocalFileSystemURI '+fileUri);
            window.webkitResolveLocalFileSystemURI(fileUri, function (fileEntry) {
                    if (onSuccess) {
                        onSuccess(fileEntry);
                    }
                },
                function (fileError) {
                    if (onFailure) {
                        onFailure("webkitResolveLocalFileSystemURI " + fileUri + " failure : " + errorMessage(fileError));
                    }
                });
        } else {
            //miapp.InternalLog.log('miapp.FileStorage','cordova.getFileFromUrl '+fileUri);
            // In Chrome window.webkitResolveLocalFileSystemURI does not exist
            this.getFileFromUrl(self.urlPrefix + fileUri, onSuccess, onFailure);
        }
    };

    /**
     * Get a URL from its filePath.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path.
     * @param {Function} onSuccess - Called with fileURL argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getUrlFromFile = function (filePath, onSuccess, onFailure) {
        //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile '+filePath);
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }

        //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile .. '+filePath);
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {

                //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile result  toURL '+fileEntry.toURL());
                //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile result  fullPath '+fileEntry.fullPath);

                if (miapp.isDefined(fileEntry.toNativeURL)){
                    //miapp.InternalLog.log('miapp.FileStorage','getUrlFromFile result  toNativeURL '+fileEntry.toNativeURL());
                    if (onSuccess) onSuccess(fileEntry.toNativeURL());
                } else {
                    //miapp.InternalLog.log('miapp.FileStorage','toNativeURL not defined, use toUrl');
                    if (onSuccess) onSuccess(fileEntry.toURL());
                }

            }, onFailure);
    };

    /**
     * Get a URI from its filePath.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path.
     * @param {Function} onSuccess - Called with fileURI argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getUriFromFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                if (onSuccess) {
                    onSuccess(fileEntry.toURI());
                }
            }, onFailure);
    };

    /**
     * Get a modification time from its filePath.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File URL.
     * @param {Function} onSuccess - Called with Date object argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getModificationTimeFromFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.getMetadata(
                    function (metadata) {
                        if (onSuccess) {
                            onSuccess(metadata.modificationTime);
                        }
                    },
                    function (fileError) {
                        if (onFailure) {
                            onFailure("getMetadata " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                        }
                    });
            }, onFailure);
    };

    /**
     * Get a file in root directory.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false}, onSuccess, onFailure);
    };

    /**
     * Creates a new file in root directory.
     * Will create file if file does not already exist. Will fail if file already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.newFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:true, exclusive:true}, onSuccess, onFailure);
    };

    /**
     * Get a existant file or create a new file in root directory.
     * Will create file if file does not already exist. Will reuse the same file if file already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with fileEntry argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.getOrNewFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:true, exclusive:false}, onSuccess, onFailure);
    };

    /**
     * Read the content of a file in root directory.
     * Will get nothing if file does not already exist.
     *
     * @param {String} filePath - File path (relative or absolute). Its direct parent directory must already exist.
     * @param {Function} onSuccess - Called with text argument if success.
     * @param {Function} onFailure - Called with error message argument if failure.
     */
    FileStorage.prototype.readFileAsDataURL = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsDataURL " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsDataURL(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };
    FileStorage.prototype.readFileAsText = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    //var blob = createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length);
                    //reader.readAsText(blob);// use 'UTF-8' encoding
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsText(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    // Not yet implemented in Cordova
    FileStorage.prototype.readFileAsArrayBuffer = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    //var blob = createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length);
                    //reader.readAsArrayBuffer(blob);
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsArrayBuffer(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    // Not yet implemented in Cordova
    FileStorage.prototype.readFileAsBinaryString = function (filePath, onSuccess, onFailure, onProgress, from, length) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    //var blob = createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length);
                    //reader.readAsBinaryString(blob);
                    if (onSuccess) {
                        reader.onload = function (evt) {
                            onSuccess(evt.target.result);
                        };
                    }
                    if (onFailure) {
                        reader.onerror = function (fileError) {
                            onFailure("readAsText " + file.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    reader.readAsBinaryString(file);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("file " + file.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    FileStorage.prototype.writeFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, toFilePath, {create:true, exclusive:false},
            function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    // WARNING : can not do truncate() + write() at the same time
                    fileWriter.onwriteend = function (evt) {
                        fileWriter.onwriteend = null;
                        if (onSuccess) {
                            fileWriter.onwrite = function (evt) {
                                onSuccess(fileEntry);
                            };
                        }
                        if (onFailure) {
                            fileWriter.onerror = function (fileError) {
                                onFailure("write or truncate " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                            };
                        }
                        fileWriter.write(fromBlob);
                    };
                    fileWriter.truncate(0);// Required if new text is shorter than previous text
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("createWriter " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    FileStorage.prototype.appendFile = function (fromBlob, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, toFilePath, {create:true, exclusive:false},
            function (fileEntry) {
                fileEntry.createWriter(function (fileWriter) {
                    if (onSuccess) {
                        fileWriter.onwrite = function (e) {
                            onSuccess(fileEntry);
                        };
                    }
                    if (onFailure) {
                        fileWriter.onerror = function (fileError) {
                            onFailure("write or seek " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                        };
                    }
                    // can do seek() + write() at the same time
                    fileWriter.seek(fileWriter.length);
                    fileWriter.write(fromBlob);
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("createWriter " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, onFailure);
    };

    FileStorage.prototype.deleteFile = function (filePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        getFileEntry(this.fs.root, filePath, {create:false, exclusive:false},
            function (fileEntry) {
                fileEntry.remove(function () {
                    if (onSuccess) {
                        onSuccess();
                    }
                }, function (fileError) {
                    if (onFailure) {
                        onFailure("remove " + fileEntry.fullPath + " failure : " + errorMessage(fileError));
                    }
                });
            }, function (message) {
                // Ignore error if file unknown. It is also a success
                if (onSuccess) {
                    onSuccess();
                }
            });
    };

    FileStorage.prototype.copyFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        //miapp.InternalLog.log('miapp.FileStorage','copyFile :'+fromFilePath+" to:"+toFilePath);
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                //miapp.InternalLog.log('miapp.FileStorage','copyFile in :'+fromFilePath+" to:"+toFilePath);
                getFileEntry(self.fs.root, fromFilePath, {create:false, exclusive:false},
                    function (fileEntry) {
                        //miapp.InternalLog.log('miapp.FileStorage','copyFile in2 :'+fromFilePath+" to:"+toFilePath);
                        fileEntry.copyTo(dirEntry, fileName, function (toFileEntry) {
                            if (onSuccess) {
                                onSuccess(toFileEntry);
                            }
                        }, function (fileError) {
                            if (onFailure) {
                                onFailure("copy " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                            }
                        });
                    }, onFailure);
            }, onFailure);

    };

    FileStorage.prototype.copyFileFromUrl = function (fromFileUrl, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        //miapp.InternalLog.log('miapp.FileStorage','copyFileFromUrl :'+fromFileUrl+" to:"+toFilePath);
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                //miapp.InternalLog.log('miapp.FileStorage','copyFileFromUrl in :'+fromFileUrl+" to:"+toFilePath);
                self.getFileFromUrl(fromFileUrl,
                    function (fileEntry) {
                        //miapp.InternalLog.log('miapp.FileStorage','copyFileFromUrl in2 :'+fromFileUrl+" to:"+toFilePath);
                        fileEntry.copyTo(dirEntry, fileName, function (toFileEntry) {
                            if (onSuccess) {
                                onSuccess(toFileEntry);
                            }
                        }, function (fileError) {
                            if (onFailure) {
                                onFailure("copy " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                            }
                        });
                    }, onFailure);
            }, onFailure);
    };

    FileStorage.prototype.moveFile = function (fromFilePath, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
                getFileEntry(self.fs.root, fromFilePath, {create:false, exclusive:false},
                    function (fileEntry) {
                        fileEntry.moveTo(dirEntry, fileName, function (toFileEntry) {
                            if (onSuccess) {
                                onSuccess(toFileEntry);
                            }
                        }, function (fileError) {
                            if (onFailure) {
                                onFailure("move " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                            }
                        });
                    }, onFailure);
            }, onFailure);

    };

    FileStorage.prototype.moveFileEntry = function (fromFileEntry, toFilePath, onSuccess, onFailure) {
        if (!this.fs) {
            throw new Error("miapp.FileStorage is not yet initialized with its file system.");
        }
        var self = this;
        var names = toFilePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] != '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }
        var dirOptions = {create:true, exclusive:false};
        getDirEntry(this.fs.root, dirOptions, dirs,
            function (dirEntry) {
    			fromFileEntry.moveTo(dirEntry, fileName, function (toFileEntry) {
                        if (onSuccess) {
                            onSuccess(toFileEntry);
                        }
                    }, function (fileError) {
                        if (onFailure) {
                            onFailure("move " + fileEntry.fullPath + " to " + dirEntry.fullPath + "/" + fileName + " failure : " + errorMessage(fileError));
                        }
                    });
            }, onFailure);

    };

    // Private API
    // helper functions and variables hidden within this function scope

    function errorMessage(fileError) {
        var msg = '';
        switch (fileError.code) {
            case FileError.NOT_FOUND_ERR:
                msg = 'File not found';
                break;
            case FileError.SECURITY_ERR:
                // You may need the --allow-file-access-from-files flag
                // if you're debugging your app from file://.
                msg = 'Security error';
                break;
            case FileError.ABORT_ERR:
                msg = 'Aborted';
                break;
            case FileError.NOT_READABLE_ERR:
                msg = 'File not readable';
                break;
            case FileError.ENCODING_ERR:
                msg = 'Encoding error';
                break;
            case FileError.NO_MODIFICATION_ALLOWED_ERR:
                msg = 'File not modifiable';
                break;
            case FileError.INVALID_STATE_ERR:
                msg = 'Invalid state';
                break;
            case FileError.SYNTAX_ERR:
                msg = 'Syntax error';
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = 'Invalid modification';
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                // You may need the --allow-file-access-from-files flag
                // if you're debugging your app from file://.
                msg = 'Quota exceeded';
                break;
            case FileError.TYPE_MISMATCH_ERR:
                msg = 'Type mismatch';
                break;
            case FileError.PATH_EXISTS_ERR:
                msg = 'File already exists';
                break;
            default:
                msg = 'Unknown FileError code (code= ' + fileError.code + ', type=' + typeof(fileError) + ')';
                break;
        }
        return msg;
    }

    function getDirEntry(dirEntry, dirOptions, dirs, onSuccess, onFailure) {

        if (dirs.length <= 0) {
            //miapp.InternalLog.log('miapp.FileStorage','getDirEntry success1');
            if (onSuccess) onSuccess(dirEntry);
            return;
        }

        var bWillThrow = false;
        var dirName = dirs[0];
        dirs = dirs.slice(1);

        //miapp.InternalLog.log('miapp.FileStorage','getDirEntry '+dirName+' '+dirOptions);
        dirEntry.getDirectory(dirName, dirOptions,
            function (dirEntry) {
                bWillThrow = true;
                //miapp.InternalLog.log('miapp.FileStorage','getDirEntry in '+dirName);
                if (dirs.length) {
                    //miapp.InternalLog.log('miapp.FileStorage','getDirEntry in2 '+dirName);
                    getDirEntry(dirEntry, dirOptions, dirs, onSuccess, onFailure);
                } else {
                    //miapp.InternalLog.log('miapp.FileStorage','getDirEntry success2 '+dirName);
                    if (onSuccess) onSuccess(dirEntry);
                }
            },
            function (fileError) {
                //miapp.InternalLog.log('miapp.FileStorage','getDirEntry fail '+dirName+' '+fileError+' '+dirOptions);
                bWillThrow = true;
                if (onFailure) onFailure("getDirectory " + dirName + " from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
            }
        );

        //setTimeout(function() {
            //miapp.InternalLog.log('miapp.FileStorage','bWillThrow ? '+bWillThrow+' '+dirName);
            // window.setTimeout(function(){console.log('wait...');},1000);
            // console.log('bWillThrow... ? '+bWillThrow);

            // if (!bWillThrow) {
            //     console.log('getDirEntry not throw pb'+' '+dirName+' '+dirOptions);
            //     //if (onFailure) onFailure("getDirectory " + dirName + " from " + dirEntry.fullPath + " failure : unknow ?");
            // }
        //},500);
    }

    function getFileEntry(rootEntry, filePath, fileOptions, onSuccess, onFailure) {
        var names = filePath.split('/');
        var max = names.length - 1;
        var fileName = names[max];
        var dirs = [];
        for (var i = 0; i < max; i++) {
            if ((names[i] !== '.') && (names[i] !== '')) {
                dirs.push(names[i]);
            }
        }

        //miapp.InternalLog.log('miapp.FileStorage','getFileEntry filePath :'+filePath+" fileOptions:"+fileOptions.create+' dirs:'+miappDumpObject("  ", dirs, 1));
        var dirOptions;
        if (fileOptions.create) {
            dirOptions = {create:true, exclusive:false};
        } else {
            dirOptions = {create:false, exclusive:false};
        }
        getDirEntry(rootEntry, dirOptions, dirs,
            function (dirEntry) {
                //miapp.InternalLog.log('miapp.FileStorage','getFileEntry in filePath :'+filePath+" fileOptions:"+fileOptions.create);
                dirEntry.getFile(fileName, fileOptions,
                    function (fileEntry) {
                        //miapp.InternalLog.log('miapp.FileStorage','getFileEntry in success filePath :'+filePath+" fileOptions:"+fileOptions.create);
                        if (onSuccess) {
                            onSuccess(fileEntry);
                        }
                    }, function (fileError) {
                        //miapp.InternalLog.log('miapp.FileStorage','getFileEntry in failure filePath :'+filePath+" fileOptions:"+fileOptions.create);
                        if (onFailure) {
                            onFailure("getFile " + fileName + " from " + dirEntry.fullPath + " failure : " + errorMessage(fileError));
                        }
                    });
            }, onFailure);
    }

    function createBlobToReadByChunks(file, reader, onSuccess, onFailure, onProgress, from, length) {
        var start = parseInt(from) || 0;
        var stop = parseInt(length) || (file.size - start);
        if (onProgress) {
            reader.onloadstart = function (evt) {
                onProgress(0, stop - start);
            };
            reader.onprogress = function (evt) {
                if (evt.lengthComputable) {
                    //var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                    onProgress(evt.loaded, evt.total);
                }
            };
            if (onSuccess) {
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        onProgress(stop - start, stop - start);
                        onSuccess(evt.target.result);
                    }
                };
            } else {
                reader.onloadend = function (evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        onProgress(stop - start, stop - start);
                    }
                };
            }
        } else if (onSuccess) {
            reader.onloadend = function (evt) {
                if (evt.target.readyState == FileReader.DONE) {
                    onSuccess(evt.target.result);
                }
            };
        }
        if (onFailure) {
            reader.onerror = function (fileError) {
                onFailure("FileReader " + file.fullPath + " failure : " + errorMessage(fileError));
            };
            reader.onabort = function (evt) {
                onFailure('Aborted by user');
            };
        }
        var blob = file.slice(start, stop);
        return blob;
    }

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return FileStorage;
})(); // Invoke the function immediately to create this class.

// An auxiliary constructor for the FileStorage class.
miapp.PredefinedFileStorage = (function () {
    // Constructor
    function PredefinedFileStorage(fileSystem, grantedBytes) {
        this.version = "0.1";
        this.fs = fileSystem;
        this.grantedBytes = grantedBytes;
    }

    // Set the prototype so that PredefinedFileStorage creates instances of FileStorage
    PredefinedFileStorage.prototype = miapp.FileStorage.prototype;

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return PredefinedFileStorage;
})(); // Invoke the function immediately to create this class.

'use strict';

function strCompare(str1, str2) {
    var lg1 = str1.length;
    var lg2 = str2.length;
    var nb = (lg1 < lg2) ? lg1 : lg2;
    for (var i = 0; i < nb; i++) {
        var c1 = str1.charCodeAt(i);
        var c2 = str2.charCodeAt(i);
        if (c1 < c2) return -1;
        if (c1 > c2) return 1;
    }
    if (lg1 < lg2) return -1;
    if (lg1 > lg2) return 1;
    return 0;
}

// BEWARE : timestamps from Saleforce are in SECONDS, while timestamp in Javascript is in MILLI-SECONDS since 1/1/1970.

function miappFormat(input) {

    if (miapp.isUndefined(input) || !input) {
        miapp.ErrorLog.log('miappFormat', 'invalid string ' + input);
        return '';
    }

    var formatted = input;
    var max = arguments.length;
    for (var i = 1; i < max; i++) {
        var regexp = new RegExp('\\{' + (i - 1) + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
}

/**
 * Return a Date object of the first day of the month
 * BEWARE : month argument value must be between 1 and 12.
 *
 * @param {Number} year
 * @param {Number} month The month as an integer between 1 and 12.
 * @returns {Date}
 */
function miappFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1, 0, 0, 0, 0);
}

/**
 * Return a Date object of the last day of the month
 * BEWARE : month argument value must be between 1 and 12.
 *
 * @param {Number} year
 * @param {Number} month The month as an integer between 1 and 12.
 * @returns {Date}
 */
function miappLastDayOfMonth(year, month) {
    return new Date(year, month, 0, 0, 0, 0, 0);
}

/**
 * Return a Date object of the dayOfWeek of the same week as the given date
 * BEWARE : in this case the week begin on Monday and end at Sunday
 *
 * @param {Date} date Any date of this week
 * @param {Number} dayOfWeek 1 for Monday, 2 for Thuesday, ... , 7 for Sunday (date.getDay() || 7)
 * @returns {Date}
 */
function miappDayOfSameWeek(date, dayOfWeek) {
    return new Date(date.getFullYear(), date.getMonth(),
        date.getDate() + dayOfWeek - (date.getDay() || 7), 0, 0, 0, 0);
}

/**
 * Return the week number of the given date
 * http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 *
 * @param {Date} date Any date of this week
 * @returns {Number}
 */
function miappWeek(date) {
    var thursday = miappDayOfSameWeek(date, 4);// Thursday of date's week is in right year to calculate Week number
    //var firstDayOfYear =  miappFirstDayOfMonth(thursday.getFullYear(), 1);
    var fourthJanuary = new Date(thursday.getFullYear(), 0, 4, 0, 0, 0, 0);// This day is always in Week 1
    var thursdayOfWeek1 = miappDayOfSameWeek(fourthJanuary, 4);// Thursday of Week 1
    var nbDays = Math.round((thursday.getTime() - thursdayOfWeek1.getTime()) / 86400000);
    return (1 + Math.floor(nbDays / 7));
}



// Namespace miapp
var miapp;
if (!miapp) miapp = {};


miapp.Utf8 = (function () {
'use strict';

    var Utf8 = {};

    // Public API


    /**
     * Encodes multi-byte Unicode string to utf-8 encoded characters
     *
     * @param {String} input Unicode string to be encoded into utf-8
     * @returns {String} UTF-8 string
     */
    Utf8.encode = function (input) {
        var utftext = '', nChr, nStrLen = input.length;
        /* transcription... */
        for (var nChrIdx = 0; nChrIdx < nStrLen; nChrIdx++) {
            nChr = input.charCodeAt(nChrIdx);
            if (nChr < 128) {
                /* one byte */
                utftext += String.fromCharCode(nChr);
            } else if (nChr < 0x800) {
                /* two bytes */
                utftext += String.fromCharCode(192 + (nChr >>> 6));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else if (nChr < 0x10000) {
                /* three bytes */
                utftext += String.fromCharCode(224 + (nChr >>> 12));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else if (nChr < 0x200000) {
                /* four bytes */
                utftext += String.fromCharCode(240 + (nChr >>> 18));
                utftext += String.fromCharCode(128 + (nChr >>> 12 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else if (nChr < 0x4000000) {
                /* five bytes */
                utftext += String.fromCharCode(248 + (nChr >>> 24));
                utftext += String.fromCharCode(128 + (nChr >>> 18 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 12 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            } else /* if (nChr <= 0x7fffffff) */ {
                /* six bytes */
                utftext += String.fromCharCode(252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824));
                utftext += String.fromCharCode(128 + (nChr >>> 24 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 18 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 12 & 63));
                utftext += String.fromCharCode(128 + (nChr >>> 6 & 63));
                utftext += String.fromCharCode(128 + (nChr & 63));
            }
        }
        return utftext;
    };

    /**
     * Encodes multi-byte Unicode string to Uint8Array characters
     *
     * @param {String} input Unicode string to be encoded into Uint8Array
     * @returns {String} Uint8Array
     */
    Utf8.encodeToUint8Array = function (input) {
        var aBytes, nChr, nStrLen = input.length, nArrLen = 0;
        /* mapping... */
        for (var nMapIdx = 0; nMapIdx < nStrLen; nMapIdx++) {
            nChr = input.charCodeAt(nMapIdx);
            nArrLen += nChr < 0x80 ? 1 : nChr < 0x800 ? 2 : nChr < 0x10000 ? 3 : nChr < 0x200000 ? 4 : nChr < 0x4000000 ? 5 : 6;
        }
        aBytes = new Uint8Array(nArrLen);
        /* transcription... */
        for (var nIdx = 0, nChrIdx = 0; nIdx < nArrLen; nChrIdx++) {
            nChr = input.charCodeAt(nChrIdx);
            if (nChr < 128) {
                /* one byte */
                aBytes[nIdx++] = nChr;
            } else if (nChr < 0x800) {
                /* two bytes */
                aBytes[nIdx++] = 192 + (nChr >>> 6);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x10000) {
                /* three bytes */
                aBytes[nIdx++] = 224 + (nChr >>> 12);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x200000) {
                /* four bytes */
                aBytes[nIdx++] = 240 + (nChr >>> 18);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else if (nChr < 0x4000000) {
                /* five bytes */
                aBytes[nIdx++] = 248 + (nChr >>> 24);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            } else /* if (nChr <= 0x7fffffff) */ {
                /* six bytes */
                aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
                aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
                aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
                aBytes[nIdx++] = 128 + (nChr & 63);
            }
        }
        return aBytes;
    };

    /**
     * Decodes utf-8 encoded string to multi-byte Unicode characters
     *
     * @param {String} input UTF-8 string to be decoded into Unicode
     * @returns {String} Unicode string
     */
    Utf8.decode = function (input) {
        var sView = "", nChr, nCode, nStrLen = input.length;
        for (var nChrIdx = 0; nChrIdx < nStrLen; nChrIdx++) {
            nChr = input.charCodeAt(nChrIdx);
            if ((nChr >= 0xfc) && (nChr <= 0xfd) && ((nChrIdx + 5) < nStrLen)) {
                /* six bytes */
                /* (nChr - 252 << 32) is not possible in ECMAScript! So...: */
                nCode = (nChr & 0x01) * 1073741824;
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 24);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 18);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xf8) && (nChr <= 0xfb) && ((nChrIdx + 4) < nStrLen)) {
                /* five bytes */
                nCode = ((nChr & 0x03) << 24);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 18);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xf0) && (nChr <= 0xf7) && ((nChrIdx + 3) < nStrLen)) {
                /* four bytes */
                nCode = ((nChr & 0x07) << 18);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xe0) && (nChr <= 0xef) && ((nChrIdx + 2) < nStrLen)) {
                /* three bytes */
                nCode = ((nChr & 0x0f) << 12);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= ((nChr & 0x3f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nChr >= 0xc0) && (nChr <= 0xdf) && ((nChrIdx + 1) < nStrLen)) {
                /* two bytes */
                nCode = ((nChr & 0x1f) << 6);
                nChr = input.charCodeAt(++nChrIdx);
                nCode |= (nChr & 0x3f);
                sView += String.fromCharCode(nCode);
            } else {
                /* one byte */
                sView += String.fromCharCode(nChr & 0x7f);
            }
        }
        return sView;
    };

    /**
     * Decodes Uint8Array to to multi-byte Unicode characters
     *
     * @param {String} aBytes Uint8Array to be decoded into Unicode
     * @returns {String} Unicode string
     */
    Utf8.decodeFromUint8Array = function (aBytes) {
        var sView = "", nPart, nCode, nLen = aBytes.length;
        for (var nIdx = 0; nIdx < nLen; nIdx++) {
            nPart = aBytes[nIdx];
            if ((nPart >= 0xfc) && (nPart <= 0xfd) && ((nIdx + 5) < nLen)) {
                /* six bytes */
                /* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
                nCode = (nPart & 0x01) * 1073741824;
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 24);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 18);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xf8) && (nPart <= 0xfb) && ((nIdx + 4) < nLen)) {
                /* five bytes */
                nCode = ((nPart & 0x03) << 24);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 18);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xf0) && (nPart <= 0xf7) && ((nIdx + 3) < nLen)) {
                /* four bytes */
                nCode = ((nPart & 0x07) << 18);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xe0) && (nPart <= 0xef) && ((nIdx + 2) < nLen)) {
                /* three bytes */
                nCode = ((nPart & 0x0f) << 12);
                nPart = aBytes[++nIdx];
                nCode += ((nPart & 0x3f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else if ((nPart >= 0xc0) && (nPart <= 0xdf) && ((nIdx + 1) < nLen)) {
                /* two bytes */
                nCode = ((nPart & 0x1f) << 6);
                nPart = aBytes[++nIdx];
                nCode += (nPart & 0x3f);
                sView += String.fromCharCode(nCode);
            } else {
                /* one byte */
                sView += String.fromCharCode(nPart & 0x7f);
            }
        }
        return sView;
    };

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Utf8;
})(); // Invoke the function immediately to create this class.

'use strict';

// Namespace miapp
var miapp;
if (!miapp) miapp = {};

miapp.Xml = (function()
{
    // Constructor
    function Xml()
    {
        this.version = "0.1";
    }

    // Public API

    Xml.isXml = function (elm) {
        // based on jQuery.isXML function
        var documentElement = (elm ? elm.ownerDocument || elm : 0).documentElement;
        return documentElement ? documentElement.nodeName !== "HTML" : false;
    };

    /**
     * Encodes a XML node to string
     */
    Xml.xml2String = function(xmlNode) {
        // based on http://www.mercurytide.co.uk/news/article/issues-when-working-ajax/
        if (!Xml.isXml(xmlNode)) {
            return false;
        }
        try { // Mozilla, Webkit, Opera
            return new XMLSerializer().serializeToString(xmlNode);
        } catch (E1) {
            try {  // IE
                return xmlNode.xml;
            } catch (E2) {

            }
        }
        return false;
    };

    /**
     * Decodes a XML node from string
     */
    Xml.string2Xml = function(xmlString) {
        // based on http://outwestmedia.com/jquery-plugins/xmldom/
        if (!dom_parser) {
            return false;
        }
        var resultXML = dom_parser.call("DOMParser" in window && (new DOMParser()) || window,
            xmlString, 'text/xml');
        return this.isXml(resultXML) ? resultXML : false;
    };

    // Private API
    // helper functions and variables hidden within this function scope

    var dom_parser = ("DOMParser" in window && (new DOMParser()).parseFromString) ||
        (window.ActiveXObject && function(_xmlString) {
            var xml_doc = new ActiveXObject('Microsoft.XMLDOM');
            xml_doc.async = 'false';
            xml_doc.loadXML(_xmlString);
            return xml_doc;
        });

    // The public API for this module is the constructor function.
    // We need to export that function from this private namespace so that
    // it can be used on the outside.
    return Xml;
})(); // Invoke the function immediately to create this class.

var miapp;
if (!miapp) miapp = {};


/**
 * Miapp Angular Auth SDK : Help your app to manage your users (login) and session shared data (sync)
 * with an angular module
 * @class miapp.angularService
 * @version 1.0
 * @example
 *   var myAngularApp = angular.module('myApp', ['MiappService','miapp.services'])
 */
miapp.angularService = (function () {
    'use strict';

    /**
     * @param $log
     * @param $q
     * @constructor
     */
    function Service($log, $q) {
        this.logger = $log;
        this.promise = $q;
        this.miappService = null;
        //this._dbRecordCount = 0;
    }

    /**
     * Init the service with miapp.io IDs
     * @param miappId {String} given miapp.io appId
     * @param miappSalt {String} given miapp.io appId
     * @param forceOnline {boolean} force connection to miapp.io hub
     * @memberof miapp.angularService
     */
    Service.prototype.init = function (miappId, miappSalt, _forceOnline, _forceEndpoint) {
        if (this.miappService) return this.promise.reject('miapp.sdk.angular.init : already initialized.');
        this.miappService = new SrvMiapp(this.logger, this.promise);
        if (_forceEndpoint) this.miappService.setAuthEndpoint(_forceEndpoint);
        return this.miappService.init(miappId, miappSalt, _forceOnline);
    };

    /**
     *
     * @param login
     * @param password
     * @param forceOnline
     * @memberof miapp.angularService
     */
    Service.prototype.login = function (login, password, forceOnline) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.login : not initialized.');
        return this.miappService.initDBWithLogin(login, password, forceOnline);
    };


    /**
     * @return true if logged in
     */
    Service.prototype.isLoggedIn = function () {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.isLoggedIn : not initialized.');
        return this.miappService.isLogin();
    };

    Service.prototype.logoff = function () {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.logoff : not initialized.');
        return this.miappService.logoff();
    };


    /**
     *
     * @param fnInitFirstData
     * @param forceOnline
     * @memberof miapp.angularService
     */
    Service.prototype.sync = function (fnInitFirstData, forceOnline) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.sync : not initialized.');
        return this.miappService.syncComplete(fnInitFirstData, this, forceOnline);
    };

    Service.prototype.put = function (data) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.put : not initialized.');
        return this.miappService.putInDb(data);
    };

    Service.prototype.find = function (id) {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.find : not initialized.');
        return this.miappService.findInDb(id);
    };

    Service.prototype.findAll = function () {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.findAll : not initialized.');
        return this.miappService.findAllInDb();
    };


    /**
     * @deprecated
     * @private
     */
    Service.prototype._testPromise = function () {
        if (!this.miappService) return this.promise.reject('miapp.sdk.angular.testPromise : not initialized.');
        return this.miappService._testPromise();
    };

    return Service;
})();


if (typeof angular !== 'undefined') {
    angular
        .module('MiappService', [])
        .factory('MiappService', function ($log, $q) {
            return new miapp.angularService($log, $q);
        });


    angular
        .module('miapp.services', [])
        .factory('srvLocalStorage', function () {

            var LocalStorage = miapp.LocalStorageFactory(window.localStorage);
            return new LocalStorage();

        });
}


// Namespace miappSdk
var miappSdk;
if (!miappSdk) miappSdk = {};
window.console = window.console || {};
window.console.log = window.console.log || function () {
    };

var miappSdkEventable = function () {
    throw Error("'miappSdkEventable' is not intended to be invoked directly");
};

miappSdkEventable.prototype = {
    bind: function (event, fn) {
        this._events = this._events || {};
        this._events[event] = this._events[event] || [];
        this._events[event].push(fn);
    },
    unbind: function (event, fn) {
        this._events = this._events || {};
        if (event in this._events === false) return;
        this._events[event].splice(this._events[event].indexOf(fn), 1);
    },
    trigger: function (event) {
        this._events = this._events || {};
        if (event in this._events === false) return;
        for (var i = 0; i < this._events[event].length; i++) {
            this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1));
        }
    }
};

miappSdkEventable.mixin = function (destObject) {
    var props = ["bind", "unbind", "trigger"];
    for (var i = 0; i < props.length; i++) {
        if (props[i] in destObject.prototype) {
            console.warn("overwriting '" + props[i] + "' on '" + destObject.name + "'.");
            console.warn("the previous version can be found at '_" + props[i] + "' on '" + destObject.name + "'.");
            destObject.prototype["_" + props[i]] = destObject.prototype[props[i]];
        }
        destObject.prototype[props[i]] = miappSdkEventable.prototype[props[i]];
    }
};

(function (global) {
    var name = "Logger", overwrittenName = global[name], exports;
    /* logging */
    function Logger(name) {
        this.logEnabled = true;
        this.init(name, true);
    }

    Logger.METHODS = ["log", "error", "warn", "info", "debug", "assert", "clear", "count", "dir", "dirxml", "exception", "group", "groupCollapsed", "groupEnd", "profile", "profileEnd", "table", "time", "timeEnd", "trace"];
    Logger.prototype.init = function (name, logEnabled) {
        this.name = name || "UNKNOWN";
        this.logEnabled = logEnabled || true;
        var addMethod = function (method) {
            this[method] = this.createLogMethod(method);
        }.bind(this);
        Logger.METHODS.forEach(addMethod);
    };
    Logger.prototype.createLogMethod = function (method) {
        return Logger.prototype.log.bind(this, method);
    };
    Logger.prototype.prefix = function (method, args) {
        var prepend = "[" + method.toUpperCase() + "][" + name + "]:	";
        if (["log", "error", "warn", "info"].indexOf(method) !== -1) {
            if ("string" === typeof args[0]) {
                args[0] = prepend + args[0];
            } else {
                args.unshift(prepend);
            }
        }
        return args;
    };
    Logger.prototype.log = function () {
        var args = [].slice.call(arguments);
        var method = args.shift();
        if (Logger.METHODS.indexOf(method) === -1) {
            method = "log";
        }
        if (!(this.logEnabled && console && console[method])) return;
        args = this.prefix(method, args);
        console[method].apply(console, args);
    };
    Logger.prototype.setLogEnabled = function (logEnabled) {
        this.logEnabled = logEnabled || true;
    };
    Logger.mixin = function (destObject) {
        destObject.__logger = new Logger(destObject.name || "UNKNOWN");
        var addMethod = function (method) {
            if (method in destObject.prototype) {
                console.warn("overwriting '" + method + "' on '" + destObject.name + "'.");
                console.warn("the previous version can be found at '_" + method + "' on '" + destObject.name + "'.");
                destObject.prototype["_" + method] = destObject.prototype[method];
            }
            destObject.prototype[method] = destObject.__logger.createLogMethod(method);
        };
        Logger.METHODS.forEach(addMethod);
    };
    global[name] = Logger;
    global[name].noConflict = function () {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return Logger;
    };
    return global[name];
})(this || window);

(function (global) {
    var name = "miappSdkPromise", overwrittenName = global[name], exports;

    function miappSdkPromise() {
        this.complete = false;
        this.error = null;
        this.result = null;
        this.callbacks = [];
    }

    miappSdkPromise.prototype.then = function (callback, context) {
        var f = function () {
            return callback.apply(context, arguments);
        };
        if (this.complete) {
            f(this.error, this.result);
        } else {
            this.callbacks.push(f);
        }
    };
    miappSdkPromise.prototype.done = function (error, result) {
        this.complete = true;
        this.error = error;
        this.result = result;
        if (this.callbacks) {
            for (var i = 0; i < this.callbacks.length; i++) this.callbacks[i](error, result);
            this.callbacks.length = 0;
        }
    };
    miappSdkPromise.join = function (promises) {
        var p = new miappSdkPromise(), total = promises.length, completed = 0, errors = [], results = [];

        function notifier(i) {
            return function (error, result) {
                completed += 1;
                errors[i] = error;
                results[i] = result;
                if (completed === total) {
                    p.done(errors, results);
                }
            };
        }

        for (var i = 0; i < total; i++) {
            promises[i]().then(notifier(i));
        }
        return p;
    };
    miappSdkPromise.chain = function (promises, error, result) {
        var p = new miappSdkPromise();
        if (promises === null || promises.length === 0) {
            p.done(error, result);
        } else {
            promises[0](error, result).then(function (res, err) {
                promises.splice(0, 1);
                if (promises) {
                    miappSdkPromise.chain(promises, res, err).then(function (r, e) {
                        p.done(r, e);
                    });
                } else {
                    p.done(res, err);
                }
            });
        }
        return p;
    };
    global[name] = miappSdkPromise;
    global[name].noConflict = function () {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return miappSdkPromise;
    };
    return global[name];
})(this || window);

(function (global) {
    var name = "Ajax", overwrittenName = global[name], exports;

    function partial() {
        var args = Array.prototype.slice.call(arguments);
        var fn = args.shift();
        return fn.bind(this, args);
    }

    function Ajax() {
        this.logger = new global.Logger(name);
        var self = this;

        function encode(data) {
            var result = "";
            if (typeof data === "string") {
                result = data;
            } else {
                var e = encodeURIComponent;
                for (var i in data) {
                    if (data.hasOwnProperty(i)) {
                        result += "&" + e(i) + "=" + e(data[i]);
                    }
                }
            }
            return result;
        }

        function request(m, u, d, token) {
            var p = new miappSdkPromise(), timeout;
            self.logger.time(m + " " + u);
            (function (xhr) {
                xhr.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        self.logger.timeEnd(m + " " + u);
                        clearTimeout(timeout);
                        p.done(null, this);
                    }
                };
                xhr.onerror = function (response) {
                    clearTimeout(timeout);
                    p.done(response, null);
                };
                xhr.oncomplete = function (response) {
                    clearTimeout(timeout);
                    self.logger.timeEnd(m + " " + u);
                    self.info("%s request to %s returned %s", m, u, self.status);
                };
                xhr.open(m, u);
                if (d) {
                    if ("object" === typeof d) {
                        d = JSON.stringify(d);
                    }
                    xhr.setRequestHeader("Content-Type", "application/json");
                    xhr.setRequestHeader("Accept", "application/json");

                    //var token = token;//self.getToken();
                    console.log('TODO token : ' + token);
                    //MLE ? xhr.withCredentials = true;
                    //MLE ? if (token) xhr.setRequestHeader('Cookie', "miappSdktoken=" + token);
                    //if (token) xhr.setRequestHeader('X-CSRF-Token', token);
                }
                timeout = setTimeout(function () {
                    xhr.abort();
                    p.done("API Call timed out.", null);
                }, 3e4);
                xhr.send(encode(d));
            })(new XMLHttpRequest());
            return p;
        }

        this.request = request;
        this.get = partial(request, "GET");
        this.post = partial(request, "POST");
        this.put = partial(request, "PUT");
        this.delete = partial(request, "DELETE");
    }

    global[name] = new Ajax();
    global[name].noConflict = function () {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return exports;
    };
    return global[name];
})(this || window);

function extend(subClass, superClass) {
    var F = function () {
    };
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    subClass.superclass = superClass.prototype;
    if (superClass.prototype.constructor == Object.prototype.constructor) {
        superClass.prototype.constructor = superClass;
    }
    return subClass;
}

function propCopy(from, to) {
    for (var prop in from) {
        if (from.hasOwnProperty(prop)) {
            if ("object" === typeof from[prop] && "object" === typeof to[prop]) {
                to[prop] = propCopy(from[prop], to[prop]);
            } else {
                to[prop] = from[prop];
            }
        }
    }
    return to;
}

function NOOP() {
}

function isValidUrl(url) {
    if (!url) return false;
    var doc, base, anchor, isValid = false;
    try {
        doc = document.implementation.createHTMLDocument("");
        base = doc.createElement("base");
        base.href = base || window.lo;
        doc.head.appendChild(base);
        anchor = doc.createElement("a");
        anchor.href = url;
        doc.body.appendChild(anchor);
        isValid = !(anchor.href === "");
    } catch (e) {
        console.error(e);
    } finally {
        doc.head.removeChild(base);
        doc.body.removeChild(anchor);
        base = null;
        anchor = null;
        doc = null;
        return isValid;
    }
}

// Tests if the string is a uuid
var uuidValueRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function isUUID(uuid) {
    return !uuid ? false : uuidValueRegex.test(uuid);
}

// method to encode the query string parameters
function encodeParams(params) {
    var queryString;
    if (params && Object.keys(params)) {
        queryString = [].slice.call(arguments).reduce(function (a, b) {
            return a.concat(b instanceof Array ? b : [b]);
        }, []).filter(function (c) {
            return "object" === typeof c;
        }).reduce(function (p, c) {
            !(c instanceof Array) ? p = p.concat(Object.keys(c).map(function (key) {
                    return [key, c[key]];
                })) : p.push(c);
            return p;
        }, []).reduce(function (p, c) {
            c.length === 2 ? p.push(c) : p = p.concat(c);
            return p;
        }, []).reduce(function (p, c) {
            c[1] instanceof Array ? c[1].forEach(function (v) {
                    p.push([c[0], v]);
                }) : p.push(c);
            return p;
        }, []).map(function (c) {
            c[1] = encodeURIComponent(c[1]);
            return c.join("=");
        }).join("&");
    }
    return queryString;
}

// method to determine whether or not the passed variable is a function
function isFunction(f) {
    return f && f !== null && typeof f === "function";
}

// a safe wrapper for executing a callback
function doCallback(callback, params, context) {
    var returnValue;
    if (isFunction(callback)) {
        if (!params) params = [];
        if (!context) context = this;
        params.push(context);
        returnValue = callback.apply(context, params);
    }
    return returnValue;
}

(function (global) {
    var self = this;
    var name = "miappSdk", overwrittenName = global[name];
    var VALID_REQUEST_METHODS = ["GET", "POST", "PUT", "DELETE"];

    function miappSdk() {
        self.logger = new Logger(name);
    }

    miappSdk.isValidEndpoint = function (endpoint) {
        return true;
    };
    miappSdk.Request = function (method, endpoint, query_params, data, callback) {
        var p = new miappSdkPromise();
        /*
         Create a logger
         */
        self.logger = new global.Logger("miappSdk.Request");
        self.logger.time("process request " + method + " " + endpoint);
        self.logger.info("REQUEST launch " + method + " " + endpoint);
        /*
         Validate our input
         */
        self.endpoint = endpoint;
        var encodedPms = encodeParams(query_params);
        if (encodedPms) self.endpoint += "?" + encodedPms;
        self.method = method.toUpperCase();
        self.data = "object" === typeof data ? JSON.stringify(data) : data;
        if (VALID_REQUEST_METHODS.indexOf(self.method) === -1) {
            throw new miappSdkInvalidHTTPMethodError("invalid request method '" + self.method + "'");
        }
        /*
         Prepare our request
         */

        //self.logger.info("REQUEST launch", self.endpoint, self.method, self.data);
        if (!isValidUrl(self.endpoint)) {
            self.logger.error(endpoint, self.endpoint, /^https:\/\//.test(endpoint));
            throw new miappSdkInvalidURIError("The provided endpoint is not valid: " + self.endpoint);
        }
        /* a callback to make the request */
        var token = null;
        if (query_params) token = query_params.access_token;
        var request = function () {
            return Ajax.request(self.method, self.endpoint, self.data, token);
        }.bind(self);
        /* a callback to process the response */
        var response = function (err, request) {
            return new miappSdk.Response(err, request);
        }.bind(self);
        /* a callback to clean up and return data to the client */
        var oncomplete = function (err, response) {
            p.done(err, response);
            //self.logger.info("REQUEST complete", err, response);
            self.logger.info("REQUEST complete " + method + " " + endpoint);
            doCallback(callback, [err, response]);
            self.logger.timeEnd("process request " + method + " " + endpoint);
        }.bind(self);
        /* and a promise to chain them all together */
        miappSdkPromise.chain([request, response]).then(oncomplete);
        return p;
    };
    miappSdk.Response = function (err, response) {
        var p = new miappSdkPromise();
        var data = null;
        try {
            data = JSON.parse(response.responseText);
        } catch (e) {
            data = {};
        }

        //MLE todo Object.keys or Object.defineProperty ?
        Object.keys(data).forEach(function (key) {
            self[key] = data[key];
        });
        self.status = parseInt(response.status);
        self.statusGroup = self.status - self.status % 100;
        /*
         in place of ....
         Object.keys(data).forEach(function(key) {
         Object.defineProperty(this, key, {
         value: data[key],
         enumerable: true
         });
         }.bind(this));
         Object.defineProperty(this, "logger", {
         enumerable: false,
         configurable: false,
         writable: false,
         value: new global.Logger(name)
         });
         Object.defineProperty(this, "success", {
         enumerable: false,
         configurable: false,
         writable: true,
         value: true
         });
         Object.defineProperty(this, "err", {
         enumerable: false,
         configurable: false,
         writable: true,
         value: err
         });
         Object.defineProperty(this, "status", {
         enumerable: false,
         configurable: false,
         writable: true,
         value: parseInt(response.status)
         });
         Object.defineProperty(this, "statusGroup", {
         enumerable: false,
         configurable: false,
         writable: true,
         value: this.status - this.status % 100
         });
         */
        switch (self.statusGroup) {
            case 200:
                self.success = true;
                break;

            case 400:
            case 500:
            case 300:
            case 100:
            default:
                self.success = false;
                break;
        }
        if (self.success) {
            p.done(null, self);
        } else {
            p.done(miappSdkError.fromResponse(data), self);
        }
        return p;
    };
    miappSdk.Response.prototype.getEntities = function () {
        var entities;
        if (self.success) {
            entities = self.data ? self.data.entities : self.entities;
        }
        return entities || [];
    };
    miappSdk.Response.prototype.getEntity = function () {
        var entities = self.getEntities();
        return entities[0];
    };
    miappSdk.VERSION = miappSdk.USERGRID_SDK_VERSION = "0.11.0";
    global[name] = miappSdk;
    global[name].noConflict = function () {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return miappSdk;
    };
    return global[name];
})(this || window);

(function (global) {
    var name = "Client", overwrittenName = global[name], exports;
    var AUTH_ERRORS = ["auth_expired_session_token", "auth_missing_credentials", "auth_unverified_oath", "expired_token", "unauthorized", "auth_invalid"];
    miappSdk.Client = function (options) {
        //console.log(this);
        this.URI = options.URI;
        if (options.orgName) {
            this.set("orgName", options.orgName);
        }
        if (options.appName) {
            this.set("appName", options.appName);
        }
        if (options.qs) {
            this.setObject("default_qs", options.qs);
        }
        this.buildCurl = options.buildCurl || false;
        this.logging = options.logging || false;
    };
    /*
     *  Main function for making requests to the API.  Can be called directly.
     *
     *  options object:
     *  `method` - http method (GET, POST, PUT, or DELETE), defaults to GET
     *  `qs` - object containing querystring values to be appended to the uri
     *  `body` - object containing entity body for POST and PUT requests
     *  `endpoint` - API endpoint, for example 'users/fred'
     *  `mQuery` - boolean, set to true if running management query, defaults to false
     *
     *  @method request
     *  @public
     *  @params {object} options
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.request = function (options, callback) {
        var method = options.method || "GET";
        var endpoint = options.endpoint;
        var body = options.body || {};
        var qs = options.qs || {};
        var mQuery = options.mQuery || false;
        var orgName = this.get("orgName");
        var appName = this.get("appName");
        var default_qs = this.getObject("default_qs");
        var uri;
        /*var logoutCallback=function(){
         if (typeof(this.logoutCallback) === 'function') {
         return this.logoutCallback(true, 'no_org_or_app_name_specified');
         }
         }.bind(this);*/
        if (!mQuery && !orgName && !appName) {
            return logoutCallback();
        }
        if (mQuery) {
            uri = this.URI + "/" + endpoint;
        } else {
            uri = this.URI + "/" + orgName + "/" + appName + "/" + endpoint;
        }
        if (this.getToken()) {
            qs.access_token = this.getToken();
        }
        if (default_qs) {
            qs = propCopy(qs, default_qs);
        }
        var self = this;
        var req = new miappSdk.Request(method, uri, qs, body, function (err, response) {
            /*if (AUTH_ERRORS.indexOf(response.error) !== -1) {
             return logoutCallback();
             }*/
            if (err) {
                doCallback(callback, [err, response, self], self);
            } else {
                doCallback(callback, [null, response, self], self);
            }
        });
    };
    /*
     *  function for building asset urls
     *
     *  @method buildAssetURL
     *  @public
     *  @params {string} uuid
     *  @return {string} assetURL
     */
    miappSdk.Client.prototype.buildAssetURL = function (uuid) {
        var self = this;
        var qs = {};
        var assetURL = this.URI + "/" + this.orgName + "/" + this.appName + "/assets/" + uuid + "/data";
        if (self.getToken()) {
            qs.access_token = self.getToken();
        }
        var encoded_params = encodeParams(qs);
        if (encoded_params) {
            assetURL += "?" + encoded_params;
        }
        return assetURL;
    };
    /*
     *  Main function for creating new groups. Call this directly.
     *
     *  @method createGroup
     *  @public
     *  @params {string} path
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.createGroup = function (options, callback) {
        var group = new miappSdk.Group({
            path: options.path,
            client: this,
            data: options
        });
        group.save(function (err, response) {
            doCallback(callback, [err, response, group], group);
        });
    };
    /*
     *  Main function for creating new entities - should be called directly.
     *
     *  options object: options {data:{'type':'collection_type', 'key':'value'}, uuid:uuid}}
     *
     *  @method createEntity
     *  @public
     *  @params {object} options
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.createEntity = function (options, callback) {
        var entity = new miappSdk.Entity({
            client: this,
            data: options
        });
        entity.save(function (err, response) {
            doCallback(callback, [err, response, entity], entity);
        });
    };
    /*
     *  Main function for getting existing entities - should be called directly.
     *
     *  You must supply a uuid or (username or name). Username only applies to users.
     *  Name applies to all custom entities
     *
     *  options object: options {data:{'type':'collection_type', 'name':'value', 'username':'value'}, uuid:uuid}}
     *
     *  @method createEntity
     *  @public
     *  @params {object} options
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.getEntity = function (options, callback) {
        var entity = new miappSdk.Entity({
            client: this,
            data: options
        });
        entity.fetch(function (err, response) {
            doCallback(callback, [err, response, entity], entity);
        });
    };
    /*
     *  Main function for restoring an entity from serialized data.
     *
     *  serializedObject should have come from entityObject.serialize();
     *
     *  @method restoreEntity
     *  @public
     *  @param {string} serializedObject
     *  @return {object} Entity Object
     */
    miappSdk.Client.prototype.restoreEntity = function (serializedObject) {
        var data = JSON.parse(serializedObject);
        var options = {
            client: this,
            data: data
        };
        var entity = new miappSdk.Entity(options);
        return entity;
    };
    /*
     *  Main function for creating new counters - should be called directly.
     *
     *  options object: options {timestamp:0, category:'value', counters:{name : value}}
     *
     *  @method createCounter
     *  @public
     *  @params {object} options
     *  @param {function} callback
     *  @return {callback} callback(err, response, counter)
     */
    miappSdk.Client.prototype.createCounter = function (options, callback) {
        var counter = new miappSdk.Counter({
            client: this,
            data: options
        });
        counter.save(callback);
    };
    /*
     *  Main function for creating new assets - should be called directly.
     *
     *  options object: options {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000", file: FileOrBlobObject }
     *
     *  @method createCounter
     *  @public
     *  @params {object} options
     *  @param {function} callback
     *  @return {callback} callback(err, response, counter)
     */
    miappSdk.Client.prototype.createAsset = function (options, callback) {
        var file = options.file;
        if (file) {
            options.name = options.name || file.name;
            options["content-type"] = options["content-type"] || file.type;
            options.path = options.path || "/";
            delete options.file;
        }
        var asset = new miappSdk.Asset({
            client: this,
            data: options
        });
        asset.save(function (err, response, asset) {
            if (file && !err) {
                asset.upload(file, callback);
            } else {
                doCallback(callback, [err, response, asset], asset);
            }
        });
    };
    /*
     *  Main function for creating new collections - should be called directly.
     *
     *  options object: options {client:client, type: type, qs:qs}
     *
     *  @method createCollection
     *  @public
     *  @params {object} options
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.createCollection = function (options, callback) {
        options.client = this;
        return new miappSdk.Collection(options, function (err, data, collection) {
            console.log("createCollection", arguments);
            doCallback(callback, [err, collection, data]);
        });
    };
    /*
     *  Main function for restoring a collection from serialized data.
     *
     *  serializedObject should have come from collectionObject.serialize();
     *
     *  @method restoreCollection
     *  @public
     *  @param {string} serializedObject
     *  @return {object} Collection Object
     */
    miappSdk.Client.prototype.restoreCollection = function (serializedObject) {
        var data = JSON.parse(serializedObject);
        data.client = this;
        var collection = new miappSdk.Collection(data);
        return collection;
    };
    /*
     *  Main function for retrieving a user's activity feed.
     *
     *  @method getFeedForUser
     *  @public
     *  @params {string} username
     *  @param {function} callback
     *  @return {callback} callback(err, data, activities)
     */
    miappSdk.Client.prototype.getFeedForUser = function (username, callback) {
        var options = {
            method: "GET",
            endpoint: "users/" + username + "/feed"
        };
        this.request(options, function (err, data) {
            if (err) {
                doCallback(callback, [err]);
            } else {
                doCallback(callback, [err, data, data.getEntities()]);
            }
        });
    };
    /*
     *  Function for creating new activities for the current user - should be called directly.
     *
     *  //user can be any of the following: "me", a uuid, a username
     *  Note: the "me" alias will reference the currently logged in user (e.g. 'users/me/activties')
     *
     *  //build a json object that looks like this:
     *  var options =
     *  {
     *    "actor" : {
     *      "displayName" :"myusername",
     *      "uuid" : "myuserid",
     *      "username" : "myusername",
     *      "email" : "myemail",
     *      "picture": "http://path/to/picture",
     *      "image" : {
     *          "duration" : 0,
     *          "height" : 80,
     *          "url" : "http://www.gravatar.com/avatar/",
     *          "width" : 80
     *      },
     *    },
     *    "verb" : "post",
     *    "content" : "My cool message",
     *    "lat" : 48.856614,
     *    "lon" : 2.352222
     *  }
     *
     *  @method createEntity
     *  @public
     *  @params {string} user // "me", a uuid, or a username
     *  @params {object} options
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.createUserActivity = function (user, options, callback) {
        options.type = "users/" + user + "/activities";
        options = {
            client: this,
            data: options
        };
        var entity = new miappSdk.Entity(options);
        entity.save(function (err, data) {
            doCallback(callback, [err, data, entity]);
        });
    };
    /*
     *  Function for creating user activities with an associated user entity.
     *
     *  user object:
     *  The user object passed into this function is an instance of miappSdk.Entity.
     *
     *  @method createUserActivityWithEntity
     *  @public
     *  @params {object} user
     *  @params {string} content
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.createUserActivityWithEntity = function (user, content, callback) {
        var username = user.get("username");
        var options = {
            actor: {
                displayName: username,
                uuid: user.get("uuid"),
                username: username,
                email: user.get("email"),
                picture: user.get("picture"),
                image: {
                    duration: 0,
                    height: 80,
                    url: user.get("picture"),
                    width: 80
                }
            },
            verb: "post",
            content: content
        };
        this.createUserActivity(username, options, callback);
    };
    /*
     *  A private method to get call timing of last call
     */
    miappSdk.Client.prototype.calcTimeDiff = function () {
        var seconds = 0;
        var time = this._end - this._start;
        try {
            seconds = (time / 10 / 60).toFixed(2);
        } catch (e) {
            return 0;
        }
        return seconds;
    };
    /*
     *  A public method to store the OAuth token for later use - uses localstorage if available
     *
     *  @method setToken
     *  @public
     *  @params {string} token
     *  @return none
     */
    miappSdk.Client.prototype.setToken = function (token) {
        this.set("token", token);
    };

    miappSdk.Client.prototype.setMiappURL = function (url) {
        this.set("miappURL", url);
        this.URI = url;
    };

    miappSdk.Client.prototype.setMiappDBURL = function (url) {
        this.set("miappDBURL", url);
    };

    miappSdk.Client.prototype.setUserId = function (userId) {
        this.set("userid", userId);
    };
    miappSdk.Client.prototype.setAppId = function (appId) {
        this.set("miappSdkid", appId);
    };


    /*
     *  A public method to get the OAuth token
     *
     *  @method getToken
     *  @public
     *  @return {string} token
     */
    miappSdk.Client.prototype.getToken = function () {
        return this.get("token");
    };

    miappSdk.Client.prototype.getEndpoint = function () {
        return this.get("endpoint");
    };

    miappSdk.Client.prototype.getUserId = function () {
        return this.get("userid");
    };
    miappSdk.Client.prototype.getAppId = function () {
        return this.get("miappSdkid");
    };

    miappSdk.Client.prototype.setObject = function (key, value) {
        if (value) {
            value = JSON.stringify(value);
        }
        this.set(key, value);
    };
    miappSdk.Client.prototype.set = function (key, value) {
        var keyStore = "miappstore_" + key;
        this[key] = value;
        if (typeof Storage !== "undefined") {
            if (value) {
                localStorage.setItem(keyStore, value);
            } else {
                localStorage.removeItem(keyStore);
            }
        }
    };
    miappSdk.Client.prototype.getObject = function (key) {
        return JSON.parse(this.get(key));
    };
    miappSdk.Client.prototype.get = function (key) {
        var keyStore = "miappstore_" + key;
        var value = null;
        if (this[key]) {
            value = this[key];
        } else if (typeof Storage !== "undefined") {
            value = localStorage.getItem(keyStore);
        }
        return value;
    };
    /*
     * A public facing helper method for signing up users
     *
     * @method signup
     * @public
     * @params {string} username
     * @params {string} password
     * @params {string} email
     * @params {string} name
     * @param {function} callback
     * @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.signup = function (username, password, email, name, callback) {
        var self = this;
        var options = {
            type: "users",
            username: username,
            password: password,
            email: email,
            name: name
        };
        this.createEntity(options, callback);
    };
    /*
     *
     *  A public method to log in an app user - stores the token for later use
     *
     *  @method login
     *  @public
     *  @params {string} username
     *  @params {string} password
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.login = function (username, password, callback) {
        var self = this;
        var options = {
            method: "POST",
            endpoint: "token",
            body: {
                username: username,
                password: password,
                grant_type: "password"
            }
        };
        self.request(options, function (err, response) {
            var user = {};
            if (err) {
                if (self.logging) console.log("error trying to log user in");
            } else {
                var options = {
                    client: self,
                    data: response.user
                };
                user = new miappSdk.Entity(options);
                self.setToken(response.access_token);
            }
            doCallback(callback, [err, response, user]);
        });
    };


    miappSdk.Client.prototype.authMLE = function (callback) {
        var self = this;
        var userId = self.getUserId();
        var appId = self.getAppId();


        // var cookieToken = Token.encryptTokenData('apifootoken');
        // request(app).post('/api/auth').set('Cookie', 'miappSdktoken=' + cookieToken)

        var options = {
            method: "POST",
            mQuery: true,
            endpoint: "auth",
            body: {
                userId: userId,
                appId: appId,
                userSrc: 'miappSdk_fwk'
            }
        };


        self.request(options, function (err, response) {
            //var user = {};
            if (err) {
                if (self.logging) console.log("error trying to auth user in : ", err);
            } else {
                //var options = {
                //    client: self,
                //    data: { _id : userId }
                //};
                if (!response.access_token) err = "no data in auth response";
                //user = new miappSdk.Entity(options);
                self.setToken(response.access_token);
                //if (response.miapp_url) self.setMiappURL(response.miapp_url);
                //if (response.miapp_db_url) self.setMiappDBURL(response.miapp_db_url);

                //self.setEndDate(response.endDate);

            }
            doCallback(callback, [err, response.miapp_url, response.miapp_db_url, response.end_date]);
        });
    };


    miappSdk.Client.prototype.loginMLE = function (appid, login, password, updateProperties, callback) {
        var self = this;
        self.setAppId(appid);
        var user = {
            name: login,
            username: login,
            email: login,
            password: password
        };
        var options = {
            method: "POST",
            mQuery: true,
            endpoint: "users",
            body: user
        };
        options.body.grant_type = "password";


        try {
            self.request(options, function (err, response) {
                if (err) {
                    if (self.logging) console.error('error trying to log user in : ',err);
                    doCallback(callback, [err, user]);
                } else {
                    user._id = response._id;
                    //user.access_token = self.getToken();
                    self.setUserId(user._id);
                    self.authMLE(function (errAuth, miappURL, miappDBURL, endDate) {

                        if (!errAuth) {
                            // Auth OK
                            user.access_token = self.getToken();
                            if (miappURL) user.miappURL = miappURL;
                            if (miappDBURL) user.miappDBURL = miappDBURL;
                            if (endDate) user.miappNeedRefresh = new Date(endDate);
                        }

                        doCallback(callback, [errAuth, user]);
                    });
                }

            });
        }
        catch (e) {
            if (self.logging) console.log("error trying to log user : " + e);
            doCallback(callback, [e, user]);
        }
    };


    miappSdk.Client.prototype.deleteUserMLE = function (userIDToDelete, callback) {
        var self = this;
        var options = {
            method: "DELETE",
            mQuery: true,
            endpoint: "users/" + userIDToDelete
        };

        // 1) userId + (cookie) src && version  && valid token 2) body vide + 204
        self.request(options, function (err, response) {
            if (err && self.logging) console.log("error trying to log user in");

            doCallback(callback, [err, response]);
        });
    };


    miappSdk.Client.prototype.reAuthenticateLite = function (callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "management/me",
            mQuery: true
        };
        self.request(options, function (err, response) {
            if (err && self.logging) {
                console.log("error trying to re-authenticate user");
            } else {
                self.setToken(response.data.access_token);
            }
            doCallback(callback, [err]);
        });
    };

    miappSdk.Client.prototype.reAuthenticateMLE = function (callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "auth/" + self.getToken(),
            mQuery: true
        };

        try {
            self.request(options, function (err, response) {
                if (err && self.logging) {
                    console.error("error trying to re-authenticate user");
                } else {
                    if (response.data.access_token) self.setToken(response.data.access_token);
                }
                doCallback(callback, [err]);
            });
        }
        catch (e) {
            if (self.logging) console.error("error trying to log user : ", e);
            doCallback(callback, [e]);
        }
    };

    miappSdk.Client.prototype.reAuthenticate = function (email, callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "management/users/" + email,
            mQuery: true
        };
        self.request(options, function (err, response) {
            var organizations = {};
            var applications = {};
            var user = {};
            var data;
            if (err && self.logging) {
                console.log("error trying to full authenticate user");
            } else {
                data = response.data;
                self.setToken(data.token);
                self.set("email", data.email);
                localStorage.setItem("accessToken", data.token);
                localStorage.setItem("userUUID", data.uuid);
                localStorage.setItem("userEmail", data.email);
                var userData = {
                    username: data.username,
                    email: data.email,
                    name: data.name,
                    uuid: data.uuid
                };
                var options = {
                    client: self,
                    data: userData
                };
                user = new miappSdk.Entity(options);
                organizations = data.organizations;
                var org = "";
                try {
                    var existingOrg = self.get("orgName");
                    org = organizations[existingOrg] ? organizations[existingOrg] : organizations[Object.keys(organizations)[0]];
                    self.set("orgName", org.name);
                } catch (e) {
                    err = true;
                    if (self.logging) {
                        console.log("error selecting org");
                    }
                }
                applications = self.parseApplicationsArray(org);
                self.selectFirstApp(applications);
                self.setObject("organizations", organizations);
                self.setObject("applications", applications);
            }
            doCallback(callback, [err, data, user, organizations, applications], self);
        });
    };
    /*
     *  A public method to log in an app user with facebook - stores the token for later use
     *
     *  @method loginFacebook
     *  @public
     *  @params {string} username
     *  @params {string} password
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.loginFacebook = function (facebookToken, callback) {
        var self = this;
        var options = {
            method: "GET",
            endpoint: "auth/facebook",
            qs: {
                fb_access_token: facebookToken
            }
        };
        this.request(options, function (err, data) {
            var user = {};
            if (err && self.logging) {
                console.log("error trying to log user in");
            } else {
                var options = {
                    client: self,
                    data: data.user
                };
                user = new miappSdk.Entity(options);
                self.setToken(data.access_token);
            }
            doCallback(callback, [err, data, user], self);
        });
    };
    /*
     *  A public method to get the currently logged in user entity
     *
     *  @method getLoggedInUser
     *  @public
     *  @param {function} callback
     *  @return {callback} callback(err, data)
     */
    miappSdk.Client.prototype.getLoggedInUser = function (callback) {
        var self = this;
        if (!this.getToken()) {
            doCallback(callback, [new miappSdkError("Access Token not set"), null, self], self);
        } else {
            var options = {
                method: "GET",
                endpoint: "users/me"
            };
            this.request(options, function (err, response) {
                if (err) {
                    if (self.logging) {
                        console.log("error trying to log user in");
                    }
                    console.error(err, response);
                    doCallback(callback, [err, response, self], self);
                } else {
                    var options = {
                        client: self,
                        data: response.getEntity()
                    };
                    var user = new miappSdk.Entity(options);
                    doCallback(callback, [null, response, user], self);
                }
            });
        }
    };
    /*
     *  A public method to test if a user is logged in - does not guarantee that the token is still valid,
     *  but rather that one exists
     *
     *  @method isLoggedIn
     *  @public
     *  @return {boolean} Returns true the user is logged in (has token and uuid), false if not
     */
    miappSdk.Client.prototype.isLoggedIn = function () {
        var token = this.getToken();
        return "undefined" !== typeof token && token !== null;
    };
    /*
     *  A public method to log out an app user - clears all user fields from client
     *
     *  @method logout
     *  @public
     *  @return none
     */
    miappSdk.Client.prototype.logout = function () {
        this.setToken();
    };
    /*
     *  A public method to destroy access tokens on the server
     *
     *  @method logout
     *  @public
     *  @param {string} username	the user associated with the token to revoke
     *  @param {string} token set to 'null' to revoke the token of the currently logged in user
     *    or set to token value to revoke a specific token
     *  @param {string} revokeAll set to 'true' to revoke all tokens for the user
     *  @return none
     */
    miappSdk.Client.prototype.destroyToken = function (username, token, revokeAll, callback) {
        var options = {
            client: self,
            method: "PUT"
        };
        if (revokeAll === true) {
            options.endpoint = "users/" + username + "/revoketokens";
        } else if (token === null) {
            options.endpoint = "users/" + username + "/revoketoken?token=" + this.getToken();
        } else {
            options.endpoint = "users/" + username + "/revoketoken?token=" + token;
        }
        this.request(options, function (err, data) {
            if (err) {
                if (self.logging) {
                    console.log("error destroying access token");
                }
                doCallback(callback, [err, data, null], self);
            } else {
                if (revokeAll === true) {
                    console.log("all user tokens invalidated");
                } else {
                    console.log("token invalidated");
                }
                doCallback(callback, [err, data, null], self);
            }
        });
    };
    /*
     *  A public method to log out an app user - clears all user fields from client
     *  and destroys the access token on the server.
     *
     *  @method logout
     *  @public
     *  @param {string} username the user associated with the token to revoke
     *  @param {string} token set to 'null' to revoke the token of the currently logged in user
     *   or set to token value to revoke a specific token
     *  @param {string} revokeAll set to 'true' to revoke all tokens for the user
     *  @return none
     */
    miappSdk.Client.prototype.logoutAndDestroyToken = function (username, token, revokeAll, callback) {
        if (username === null) {
            console.log("username required to revoke tokens");
        } else {
            this.destroyToken(username, token, revokeAll, callback);
            if (revokeAll === true || token === this.getToken() || token === null) {
                this.setToken(null);
            }
        }
    };
    /*
     *  A private method to build the curl call to display on the command line
     *
     *  @method buildCurlCall
     *  @private
     *  @param {object} options
     *  @return {string} curl
     */
    miappSdk.Client.prototype.buildCurlCall = function (options) {
        var curl = ["curl"];
        var method = (options.method || "GET").toUpperCase();
        var body = options.body;
        var uri = options.uri;
        curl.push("-X");
        curl.push(["POST", "PUT", "DELETE"].indexOf(method) >= 0 ? method : "GET");
        curl.push(uri);
        if ("object" === typeof body && Object.keys(body).length > 0 && ["POST", "PUT"].indexOf(method) !== -1) {
            curl.push("-d");
            curl.push("'" + JSON.stringify(body) + "'");
        }
        curl = curl.join(" ");
        console.log(curl);
        return curl;
    };
    miappSdk.Client.prototype.getDisplayImage = function (email, picture, size) {
        size = size || 50;
        var image = "https://apigee.com/miappSdk/images/user_profile.png";
        try {
            if (picture) {
                image = picture;
            } else if (email.length) {
                image = "https://secure.gravatar.com/avatar/" + MD5(email) + "?s=" + size + encodeURI("&d=https://apigee.com/miappSdk/images/user_profile.png");
            }
        } catch (e) {
        } finally {
            return image;
        }
    };
    global[name] = miappSdk.Client;
    global[name].noConflict = function () {
        if (overwrittenName) {
            global[name] = overwrittenName;
        }
        return exports;
    };
    return global[name];
})(this || window);

var ENTITY_SYSTEM_PROPERTIES = ["metadata", "created", "modified", "oldpassword", "newpassword", "type", "activated", "uuid"];

// A class to Model a miappSdk Entity.
// Set the type and uuid of entity in the 'data' json object
// @param {object} options {client:client, data:{'type':'collection_type', uuid:'uuid', 'key':'value'}}
miappSdk.Entity = function (options) {
    this._data = {};
    this._client = undefined;
    if (options) {
        this.set(options.data || {});
        this._client = options.client || {};
    }
};

/*
 *  method to determine whether or not the passed variable is a miappSdk Entity
 *
 *  @method isEntity
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
miappSdk.Entity.isEntity = function (obj) {
    return obj && obj instanceof miappSdk.Entity;
};

/*
 *  method to determine whether or not the passed variable is a miappSdk Entity
 *  That has been saved.
 *
 *  @method isPersistedEntity
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
miappSdk.Entity.isPersistedEntity = function (obj) {
    return isEntity(obj) && isUUID(obj.get("uuid"));
};

/*
 *  returns a serialized version of the entity object
 *
 *  Note: use the client.restoreEntity() function to restore
 *
 *  @method serialize
 *  @return {string} data
 */
miappSdk.Entity.prototype.serialize = function () {
    return JSON.stringify(this._data);
};

/*
 *  gets a specific field or the entire data object. If null or no argument
 *  passed, will return all data, else, will return a specific field
 *
 *  @method get
 *  @param {string} field
 *  @return {string} || {object} data
 */
miappSdk.Entity.prototype.get = function (key) {
    var value;
    if (arguments.length === 0) {
        value = this._data;
    } else if (arguments.length > 1) {
        key = [].slice.call(arguments).reduce(function (p, c, i, a) {
            if (c instanceof Array) {
                p = p.concat(c);
            } else {
                p.push(c);
            }
            return p;
        }, []);
    }
    if (key instanceof Array) {
        var self = this;
        value = key.map(function (k) {
            return self.get(k);
        });
    } else if ("undefined" !== typeof key) {
        value = this._data[key];
    }
    return value;
};

/*
 *  adds a specific key value pair or object to the Entity's data
 *  is additive - will not overwrite existing values unless they
 *  are explicitly specified
 *
 *  @method set
 *  @param {string} key || {object}
 *  @param {string} value
 *  @return none
 */
miappSdk.Entity.prototype.set = function (key, value) {
    if (typeof key === "object") {
        for (var field in key) {
            this._data[field] = key[field];
        }
    } else if (typeof key === "string") {
        if (value === null) {
            delete this._data[key];
        } else {
            this._data[key] = value;
        }
    } else {
        this._data = {};
    }
};

miappSdk.Entity.prototype.getEndpoint = function () {
    var type = this.get("type"), nameProperties = ["uuid", "name"], name;
    if (type === undefined) {
        throw new miappSdkError("cannot fetch entity, no entity type specified", "no_type_specified");
    } else if (/^users?$/.test(type)) {
        nameProperties.unshift("username");
    }
    name = this.get(nameProperties).filter(function (x) {
        return x !== null && "undefined" !== typeof x;
    }).shift();
    return name ? [type, name].join("/") : type;
};

/*
 *  Saves the entity back to the database
 *
 *  @method save
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, response, self)
 */
miappSdk.Entity.prototype.save = function (callback) {
    var self = this, type = this.get("type"), method = "POST", entityId = this.get("uuid"), changePassword, entityData = this.get(), options = {
        method: method,
        endpoint: type
    };
    if (entityId) {
        options.method = "PUT";
        options.endpoint += "/" + entityId;
    }
    options.body = Object.keys(entityData).filter(function (key) {
        return ENTITY_SYSTEM_PROPERTIES.indexOf(key) === -1;
    }).reduce(function (data, key) {
        data[key] = entityData[key];
        return data;
    }, {});
    self._client.request(options, function (err, response) {
        var entity = response.getEntity();
        if (entity) {
            self.set(entity);
            self.set("type", /^\//.test(response.path) ? response.path.substring(1) : response.path);
        }
        if (err && self._client.logging) {
            console.log("could not save entity");
        }
        doCallback(callback, [err, response, self], self);
    });
};

/*
 *
 * Updates the user's password
 */
miappSdk.Entity.prototype.changePassword = function (oldpassword, newpassword, callback) {
    var self = this;
    if ("function" === typeof oldpassword && callback === undefined) {
        callback = oldpassword;
        oldpassword = self.get("oldpassword");
        newpassword = self.get("newpassword");
    }
    self.set({
        password: null,
        oldpassword: null,
        newpassword: null
    });
    if (/^users?$/.test(self.get("type")) && oldpassword && newpassword) {
        var options = {
            method: "PUT",
            endpoint: "users/" + self.get("uuid") + "/password",
            body: {
                uuid: self.get("uuid"),
                username: self.get("username"),
                oldpassword: oldpassword,
                newpassword: newpassword
            }
        };
        self._client.request(options, function (err, response) {
            if (err && self._client.logging) {
                console.log("could not update user");
            }
            doCallback(callback, [err, response, self], self);
        });
    } else {
        throw new miappSdkInvalidArgumentError("Invalid arguments passed to 'changePassword'");
    }
};

/*
 *  refreshes the entity by making a GET call back to the database
 *
 *  @method fetch
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
miappSdk.Entity.prototype.fetch = function (callback) {
    var endpoint, self = this;
    endpoint = this.getEndpoint();
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        var entity = response.getEntity();
        if (entity) {
            self.set(entity);
        }
        doCallback(callback, [err, response, self], self);
    });
};

/*
 *  deletes the entity from the database - will only delete
 *  if the object has a valid uuid
 *
 *  @method destroy
 *  @public
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
miappSdk.Entity.prototype.destroy = function (callback) {
    var self = this;
    var endpoint = this.getEndpoint();
    var options = {
        method: "DELETE",
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        if (!err) {
            self.set(null);
        }
        doCallback(callback, [err, response, self], self);
    });
};

/*
 *  connects one entity to another
 *
 *  @method connect
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
miappSdk.Entity.prototype.connect = function (connection, entity, callback) {
    this.addOrRemoveConnection("POST", connection, entity, callback);
};

/*
 *  disconnects one entity from another
 *
 *  @method disconnect
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
miappSdk.Entity.prototype.disconnect = function (connection, entity, callback) {
    this.addOrRemoveConnection("DELETE", connection, entity, callback);
};

/*
 *  adds or removes a connection between two entities
 *
 *  @method addOrRemoveConnection
 *  @public
 *  @param {string} method
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
miappSdk.Entity.prototype.addOrRemoveConnection = function (method, connection, entity, callback) {
    var self = this;
    if (["POST", "DELETE"].indexOf(method.toUpperCase()) == -1) {
        throw new miappSdkInvalidArgumentError("invalid method for connection call. must be 'POST' or 'DELETE'");
    }
    var connecteeType = entity.get("type");
    var connectee = this.getEntityId(entity);
    if (!connectee) {
        throw new miappSdkInvalidArgumentError("connectee could not be identified");
    }
    var connectorType = this.get("type");
    var connector = this.getEntityId(this);
    if (!connector) {
        throw new miappSdkInvalidArgumentError("connector could not be identified");
    }
    var endpoint = [connectorType, connector, connection, connecteeType, connectee].join("/");
    var options = {
        method: method,
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        if (err && self._client.logging) {
            console.log("There was an error with the connection call");
        }
        doCallback(callback, [err, response, self], self);
    });
};

/*
 *  returns a unique identifier for an entity
 *
 *  @method connect
 *  @public
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 *
 */
miappSdk.Entity.prototype.getEntityId = function (entity) {
    var id;
    if (isUUID(entity.get("uuid"))) {
        id = entity.get("uuid");
    } else if (this.get("type") === "users" || this.get("type") === "user") {
        id = entity.get("username");
    } else {
        id = entity.get("name");
    }
    return id;
};

/*
 *  gets an entities connections
 *
 *  @method getConnections
 *  @public
 *  @param {string} connection
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data, connections)
 *
 */
miappSdk.Entity.prototype.getConnections = function (connection, callback) {
    var self = this;
    var connectorType = this.get("type");
    var connector = this.getEntityId(this);
    if (!connector) {
        if (typeof callback === "function") {
            var error = "Error in getConnections - no uuid specified.";
            if (self._client.logging) {
                console.log(error);
            }
            doCallback(callback, [true, error], self);
        }
        return;
    }
    var endpoint = connectorType + "/" + connector + "/" + connection + "/";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        self[connection] = {};
        var length = data && data.entities ? data.entities.length : 0;
        for (var i = 0; i < length; i++) {
            if (data.entities[i].type === "user") {
                self[connection][data.entities[i].username] = data.entities[i];
            } else {
                self[connection][data.entities[i].name] = data.entities[i];
            }
        }
        doCallback(callback, [err, data, data.entities], self);
    });
};

miappSdk.Entity.prototype.getGroups = function (callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/groups";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        self.groups = data.entities;
        doCallback(callback, [err, data, data.entities], self);
    });
};

miappSdk.Entity.prototype.getActivities = function (callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/activities";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("entity could not be connected");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
        }
        self.activities = data.entities;
        doCallback(callback, [err, data, data.entities], self);
    });
};

miappSdk.Entity.prototype.getFollowing = function (callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/following";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("could not get user following");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image;
        }
        self.following = data.entities;
        doCallback(callback, [err, data, data.entities], self);
    });
};

miappSdk.Entity.prototype.getFollowers = function (callback) {
    var self = this;
    var endpoint = "users" + "/" + this.get("uuid") + "/followers";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("could not get user followers");
        }
        for (var entity in data.entities) {
            data.entities[entity].createdDate = new Date(data.entities[entity].created).toUTCString();
            var image = self._client.getDisplayImage(data.entities[entity].email, data.entities[entity].picture);
            data.entities[entity]._portal_image_icon = image;
        }
        self.followers = data.entities;
        doCallback(callback, [err, data, data.entities], self);
    });
};

miappSdk.Client.prototype.createRole = function (roleName, permissions, callback) {
    var options = {
        type: "role",
        name: roleName
    };
    this.createEntity(options, function (err, response, entity) {
        if (err) {
            doCallback(callback, [err, response, self]);
        } else {
            entity.assignPermissions(permissions, function (err, data) {
                if (err) {
                    doCallback(callback, [err, response, self]);
                } else {
                    doCallback(callback, [err, data, data.data], self);
                }
            });
        }
    });
};

miappSdk.Entity.prototype.getRoles = function (callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/roles";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("could not get user roles");
        }
        self.roles = data.entities;
        doCallback(callback, [err, data, data.entities], self);
    });
};

miappSdk.Entity.prototype.assignRole = function (roleName, callback) {
    var self = this;
    var type = self.get("type");
    var collection = type + "s";
    var entityID;
    if (type == "user" && this.get("username") != null) {
        entityID = self.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = self.get("name");
    } else if (this.get("uuid") != null) {
        entityID = self.get("uuid");
    }
    if (type != "users" && type != "groups") {
        doCallback(callback, [new miappSdkError("entity must be a group or user", "invalid_entity_type"), null, this], this);
    }
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID;
    var options = {
        method: "POST",
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        if (err) {
            console.log("Could not assign role.");
        }
        doCallback(callback, [err, response, self]);
    });
};

miappSdk.Entity.prototype.removeRole = function (roleName, callback) {
    var self = this;
    var type = self.get("type");
    var collection = type + "s";
    var entityID;
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    if (type != "users" && type != "groups") {
        doCallback(callback, [new miappSdkError("entity must be a group or user", "invalid_entity_type"), null, this], this);
    }
    var endpoint = "roles/" + roleName + "/" + collection + "/" + entityID;
    var options = {
        method: "DELETE",
        endpoint: endpoint
    };
    this._client.request(options, function (err, response) {
        if (err) {
            console.log("Could not assign role.");
        }
        doCallback(callback, [err, response, self]);
    });
};

miappSdk.Entity.prototype.assignPermissions = function (permissions, callback) {
    var self = this;
    var entityID;
    var type = this.get("type");
    if (type != "user" && type != "users" && type != "group" && type != "groups" && type != "role" && type != "roles") {
        doCallback(callback, [new miappSdkError("entity must be a group, user, or role", "invalid_entity_type"), null, this], this);
    }
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    var endpoint = type + "/" + entityID + "/permissions";
    var options = {
        method: "POST",
        endpoint: endpoint,
        body: {
            permission: permissions
        }
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("could not assign permissions");
        }
        doCallback(callback, [err, data, data.data], self);
    });
};

miappSdk.Entity.prototype.removePermissions = function (permissions, callback) {
    var self = this;
    var entityID;
    var type = this.get("type");
    if (type != "user" && type != "users" && type != "group" && type != "groups" && type != "role" && type != "roles") {
        doCallback(callback, [new miappSdkError("entity must be a group, user, or role", "invalid_entity_type"), null, this], this);
    }
    if (type == "user" && this.get("username") != null) {
        entityID = this.get("username");
    } else if (type == "group" && this.get("name") != null) {
        entityID = this.get("name");
    } else if (this.get("uuid") != null) {
        entityID = this.get("uuid");
    }
    var endpoint = type + "/" + entityID + "/permissions";
    var options = {
        method: "DELETE",
        endpoint: endpoint,
        qs: {
            permission: permissions
        }
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("could not remove permissions");
        }
        doCallback(callback, [err, data, data.params.permission], self);
    });
};

miappSdk.Entity.prototype.getPermissions = function (callback) {
    var self = this;
    var endpoint = this.get("type") + "/" + this.get("uuid") + "/permissions";
    var options = {
        method: "GET",
        endpoint: endpoint
    };
    this._client.request(options, function (err, data) {
        if (err && self._client.logging) {
            console.log("could not get user permissions");
        }
        var permissions = [];
        if (data.data) {
            var perms = data.data;
            var count = 0;
            for (var i in perms) {
                count++;
                var perm = perms[i];
                var parts = perm.split(":");
                var ops_part = "";
                var path_part = parts[0];
                if (parts.length > 1) {
                    ops_part = parts[0];
                    path_part = parts[1];
                }
                ops_part = ops_part.replace("*", "get,post,put,delete");
                var ops = ops_part.split(",");
                var ops_object = {};
                ops_object.get = "no";
                ops_object.post = "no";
                ops_object.put = "no";
                ops_object.delete = "no";
                for (var j in ops) {
                    ops_object[ops[j]] = "yes";
                }
                permissions.push({
                    operations: ops_object,
                    path: path_part,
                    perm: perm
                });
            }
        }
        self.permissions = permissions;
        doCallback(callback, [err, data, data.entities], self);
    });
};

/*
 *  The Collection class models miappSdk Collections.  It essentially
 *  acts as a container for holding Entity objects, while providing
 *  additional funcitonality such as paging, and saving
 *
 *  @constructor
 *  @param {string} options - configuration object
 *  @return {Collection} collection
 */
miappSdk.Collection = function (options) {
    if (options) {
        this._client = options.client;
        this._type = options.type;
        this.qs = options.qs || {};
        this._list = options.list || [];
        this._iterator = options.iterator || -1;
        this._previous = options.previous || [];
        this._next = options.next || null;
        this._cursor = options.cursor || null;
        if (options.list) {
            var count = options.list.length;
            for (var i = 0; i < count; i++) {
                var entity = this._client.restoreEntity(options.list[i]);
                this._list[i] = entity;
            }
        }
    }
};

/*
 *  method to determine whether or not the passed variable is a miappSdk Collection
 *
 *  @method isCollection
 *  @public
 *  @params {any} obj - any variable
 *  @return {boolean} Returns true or false
 */
miappSdk.isCollection = function (obj) {
    return obj && obj instanceof miappSdk.Collection;
};

/*
 *  gets the data from the collection object for serialization
 *
 *  @method serialize
 *  @return {object} data
 */
miappSdk.Collection.prototype.serialize = function () {
    var data = {};
    data.type = this._type;
    data.qs = this.qs;
    data.iterator = this._iterator;
    data.previous = this._previous;
    data.next = this._next;
    data.cursor = this._cursor;
    this.resetEntityPointer();
    var i = 0;
    data.list = [];
    while (this.hasNextEntity()) {
        var entity = this.getNextEntity();
        data.list[i] = entity.serialize();
        i++;
    }
    data = JSON.stringify(data);
    return data;
};

/*miappSdk.Collection.prototype.addCollection = function (collectionName, options, callback) {
 self = this;
 options.client = this._client;
 var collection = new miappSdk.Collection(options, function(err, data) {
 if (typeof(callback) === 'function') {

 collection.resetEntityPointer();
 while(collection.hasNextEntity()) {
 var user = collection.getNextEntity();
 var email = user.get('email');
 var image = self._client.getDisplayImage(user.get('email'), user.get('picture'));
 user._portal_image_icon = image;
 }

 self[collectionName] = collection;
 doCallback(callback, [err, collection], self);
 }
 });
 };*/
/*
 *  Populates the collection from the server
 *
 *  @method fetch
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
miappSdk.Collection.prototype.fetch = function (callback) {
    var self = this;
    var qs = this.qs;
    if (this._cursor) {
        qs.cursor = this._cursor;
    } else {
        delete qs.cursor;
    }
    var options = {
        method: "GET",
        endpoint: this._type,
        qs: this.qs
    };
    this._client.request(options, function (err, response) {
        if (err && self._client.logging) {
            console.log("error getting collection");
        } else {
            self.saveCursor(response.cursor || null);
            self.resetEntityPointer();
            self._list = response.getEntities().filter(function (entity) {
                return isUUID(entity.uuid);
            }).map(function (entity) {
                var ent = new miappSdk.Entity({
                    client: self._client
                });
                ent.set(entity);
                ent.type = self._type;
                return ent;
            });
        }
        doCallback(callback, [err, response, self], self);
    });
};

/*
 *  Adds a new Entity to the collection (saves, then adds to the local object)
 *
 *  @method addNewEntity
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data, entity)
 */
miappSdk.Collection.prototype.addEntity = function (entityObject, callback) {
    var self = this;
    entityObject.type = this._type;
    this._client.createEntity(entityObject, function (err, response, entity) {
        if (!err) {
            self.addExistingEntity(entity);
        }
        doCallback(callback, [err, response, self], self);
    });
};

miappSdk.Collection.prototype.addExistingEntity = function (entity) {
    var count = this._list.length;
    this._list[count] = entity;
};

/*
 *  Removes the Entity from the collection, then destroys the object on the server
 *
 *  @method destroyEntity
 *  @param {object} entity
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
miappSdk.Collection.prototype.destroyEntity = function (entity, callback) {
    var self = this;
    entity.destroy(function (err, response) {
        if (err) {
            if (self._client.logging) {
                console.log("could not destroy entity");
            }
            doCallback(callback, [err, response, self], self);
        } else {
            self.fetch(callback);
        }
        self.removeEntity(entity);
    });
};

/*
 * Filters the list of entities based on the supplied criteria function
 * works like Array.prototype.filter
 *
 *  @method getEntitiesByCriteria
 *  @param {function} criteria  A function that takes each entity as an argument and returns true or false
 *  @return {Entity[]} returns a list of entities that caused the criteria function to return true
 */
miappSdk.Collection.prototype.getEntitiesByCriteria = function (criteria) {
    return this._list.filter(criteria);
};

/*
 * Returns the first entity from the list of entities based on the supplied criteria function
 * works like Array.prototype.filter
 *
 *  @method getEntitiesByCriteria
 *  @param {function} criteria  A function that takes each entity as an argument and returns true or false
 *  @return {Entity[]} returns a list of entities that caused the criteria function to return true
 */
miappSdk.Collection.prototype.getEntityByCriteria = function (criteria) {
    return this.getEntitiesByCriteria(criteria).shift();
};

/*
 * Removed an entity from the collection without destroying it on the server
 *
 *  @method removeEntity
 *  @param {object} entity
 *  @return {Entity} returns the removed entity or undefined if it was not found
 */
miappSdk.Collection.prototype.removeEntity = function (entity) {
    var removedEntity = this.getEntityByCriteria(function (item) {
        return entity.uuid === item.get("uuid");
    });
    delete this._list[this._list.indexOf(removedEntity)];
    return removedEntity;
};

/*
 *  Looks up an Entity by UUID
 *
 *  @method getEntityByUUID
 *  @param {string} UUID
 *  @param {function} callback
 *  @return {callback} callback(err, data, entity)
 */
miappSdk.Collection.prototype.getEntityByUUID = function (uuid, callback) {
    var entity = this.getEntityByCriteria(function (item) {
        return item.get("uuid") === uuid;
    });
    if (entity) {
        doCallback(callback, [null, entity, entity], this);
    } else {
        var options = {
            data: {
                type: this._type,
                uuid: uuid
            },
            client: this._client
        };
        entity = new miappSdk.Entity(options);
        entity.fetch(callback);
    }
};

/*
 *  Returns the first Entity of the Entity list - does not affect the iterator
 *
 *  @method getFirstEntity
 *  @return {object} returns an entity object
 */
miappSdk.Collection.prototype.getFirstEntity = function () {
    var count = this._list.length;
    if (count > 0) {
        return this._list[0];
    }
    return null;
};

/*
 *  Returns the last Entity of the Entity list - does not affect the iterator
 *
 *  @method getLastEntity
 *  @return {object} returns an entity object
 */
miappSdk.Collection.prototype.getLastEntity = function () {
    var count = this._list.length;
    if (count > 0) {
        return this._list[count - 1];
    }
    return null;
};

/*
 *  Entity iteration -Checks to see if there is a "next" entity
 *  in the list.  The first time this method is called on an entity
 *  list, or after the resetEntityPointer method is called, it will
 *  return true referencing the first entity in the list
 *
 *  @method hasNextEntity
 *  @return {boolean} true if there is a next entity, false if not
 */
miappSdk.Collection.prototype.hasNextEntity = function () {
    var next = this._iterator + 1;
    var hasNextElement = next >= 0 && next < this._list.length;
    if (hasNextElement) {
        return true;
    }
    return false;
};

/*
 *  Entity iteration - Gets the "next" entity in the list.  The first
 *  time this method is called on an entity list, or after the method
 *  resetEntityPointer is called, it will return the,
 *  first entity in the list
 *
 *  @method hasNextEntity
 *  @return {object} entity
 */
miappSdk.Collection.prototype.getNextEntity = function () {
    this._iterator++;
    var hasNextElement = this._iterator >= 0 && this._iterator <= this._list.length;
    if (hasNextElement) {
        return this._list[this._iterator];
    }
    return false;
};

/*
 *  Entity iteration - Checks to see if there is a "previous"
 *  entity in the list.
 *
 *  @method hasPrevEntity
 *  @return {boolean} true if there is a previous entity, false if not
 */
miappSdk.Collection.prototype.hasPrevEntity = function () {
    var previous = this._iterator - 1;
    var hasPreviousElement = previous >= 0 && previous < this._list.length;
    if (hasPreviousElement) {
        return true;
    }
    return false;
};

/*
 *  Entity iteration - Gets the "previous" entity in the list.
 *
 *  @method getPrevEntity
 *  @return {object} entity
 */
miappSdk.Collection.prototype.getPrevEntity = function () {
    this._iterator--;
    var hasPreviousElement = this._iterator >= 0 && this._iterator <= this._list.length;
    if (hasPreviousElement) {
        return this._list[this._iterator];
    }
    return false;
};

/*
 *  Entity iteration - Resets the iterator back to the beginning
 *  of the list
 *
 *  @method resetEntityPointer
 *  @return none
 */
miappSdk.Collection.prototype.resetEntityPointer = function () {
    this._iterator = -1;
};

/*
 * Method to save off the cursor just returned by the last API call
 *
 * @public
 * @method saveCursor
 * @return none
 */
miappSdk.Collection.prototype.saveCursor = function (cursor) {
    if (this._next !== cursor) {
        this._next = cursor;
    }
};

/*
 * Resets the paging pointer (back to original page)
 *
 * @public
 * @method resetPaging
 * @return none
 */
miappSdk.Collection.prototype.resetPaging = function () {
    this._previous = [];
    this._next = null;
    this._cursor = null;
};

/*
 *  Paging -  checks to see if there is a next page od data
 *
 *  @method hasNextPage
 *  @return {boolean} returns true if there is a next page of data, false otherwise
 */
miappSdk.Collection.prototype.hasNextPage = function () {
    return this._next;
};

/*
 *  Paging - advances the cursor and gets the next
 *  page of data from the API.  Stores returned entities
 *  in the Entity list.
 *
 *  @method getNextPage
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
miappSdk.Collection.prototype.getNextPage = function (callback) {
    if (this.hasNextPage()) {
        this._previous.push(this._cursor);
        this._cursor = this._next;
        this._list = [];
        this.fetch(callback);
    }
};

/*
 *  Paging -  checks to see if there is a previous page od data
 *
 *  @method hasPreviousPage
 *  @return {boolean} returns true if there is a previous page of data, false otherwise
 */
miappSdk.Collection.prototype.hasPreviousPage = function () {
    return this._previous.length > 0;
};

/*
 *  Paging - reverts the cursor and gets the previous
 *  page of data from the API.  Stores returned entities
 *  in the Entity list.
 *
 *  @method getPreviousPage
 *  @param {function} callback
 *  @return {callback} callback(err, data)
 */
miappSdk.Collection.prototype.getPreviousPage = function (callback) {
    if (this.hasPreviousPage()) {
        this._next = null;
        this._cursor = this._previous.pop();
        this._list = [];
        this.fetch(callback);
    }
};

/*
 *  A class to model a miappSdk group.
 *  Set the path in the options object.
 *
 *  @constructor
 *  @param {object} options {client:client, data: {'key': 'value'}, path:'path'}
 */
miappSdk.Group = function (options, callback) {
    this._path = options.path;
    this._list = [];
    this._client = options.client;
    this._data = options.data || {};
    this._data.type = "groups";
};

/*
 *  Inherit from miappSdk.Entity.
 *  Note: This only accounts for data on the group object itself.
 *  You need to use add and remove to manipulate group membership.
 */
miappSdk.Group.prototype = new miappSdk.Entity();

/*
 *  Fetches current group data, and members.
 *
 *  @method fetch
 *  @public
 *  @param {function} callback
 *  @returns {function} callback(err, data)
 */
miappSdk.Group.prototype.fetch = function (callback) {
    var self = this;
    var groupEndpoint = "groups/" + this._path;
    var memberEndpoint = "groups/" + this._path + "/users";
    var groupOptions = {
        method: "GET",
        endpoint: groupEndpoint
    };
    var memberOptions = {
        method: "GET",
        endpoint: memberEndpoint
    };
    this._client.request(groupOptions, function (err, response) {
        if (err) {
            if (self._client.logging) {
                console.log("error getting group");
            }
            doCallback(callback, [err, response], self);
        } else {
            var entities = response.getEntities();
            if (entities && entities.length) {
                var groupresponse = entities.shift();
                self._client.request(memberOptions, function (err, response) {
                    if (err && self._client.logging) {
                        console.log("error getting group users");
                    } else {
                        self._list = response.getEntities().filter(function (entity) {
                            return isUUID(entity.uuid);
                        }).map(function (entity) {
                            return new miappSdk.Entity({
                                type: entity.type,
                                client: self._client,
                                uuid: entity.uuid,
                                response: entity
                            });
                        });
                    }
                    doCallback(callback, [err, response, self], self);
                });
            }
        }
    });
};

/*
 *  Retrieves the members of a group.
 *
 *  @method members
 *  @public
 *  @param {function} callback
 *  @return {function} callback(err, data);
 */
miappSdk.Group.prototype.members = function (callback) {
    return this._list;
};

/*
 *  Adds an existing user to the group, and refreshes the group object.
 *
 *  Options object: {user: user_entity}
 *
 *  @method add
 *  @public
 *  @params {object} options
 *  @param {function} callback
 *  @return {function} callback(err, data)
 */
miappSdk.Group.prototype.add = function (options, callback) {
    var self = this;
    if (options.user) {
        options = {
            method: "POST",
            endpoint: "groups/" + this._path + "/users/" + options.user.get("username")
        };
        this._client.request(options, function (error, response) {
            if (error) {
                doCallback(callback, [error, response, self], self);
            } else {
                self.fetch(callback);
            }
        });
    } else {
        doCallback(callback, [new miappSdkError("no user specified", "no_user_specified"), null, this], this);
    }
};

/*
 *  Removes a user from a group, and refreshes the group object.
 *
 *  Options object: {user: user_entity}
 *
 *  @method remove
 *  @public
 *  @params {object} options
 *  @param {function} callback
 *  @return {function} callback(err, data)
 */
miappSdk.Group.prototype.remove = function (options, callback) {
    var self = this;
    if (options.user) {
        options = {
            method: "DELETE",
            endpoint: "groups/" + this._path + "/users/" + options.user.username
        };
        this._client.request(options, function (error, response) {
            if (error) {
                doCallback(callback, [error, response, self], self);
            } else {
                self.fetch(callback);
            }
        });
    } else {
        doCallback(callback, [new miappSdkError("no user specified", "no_user_specified"), null, this], this);
    }
};

/*
 * Gets feed for a group.
 *
 * @public
 * @method feed
 * @param {function} callback
 * @returns {callback} callback(err, data, activities)
 */
miappSdk.Group.prototype.feed = function (callback) {
    var self = this;
    var options = {
        method: "GET",
        endpoint: "groups/" + this._path + "/feed"
    };
    this._client.request(options, function (err, response) {
        doCallback(callback, [err, response, self], self);
    });
};

/*
 * Creates activity and posts to group feed.
 *
 * options object: {user: user_entity, content: "activity content"}
 *
 * @public
 * @method createGroupActivity
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, entity)
 */
miappSdk.Group.prototype.createGroupActivity = function (options, callback) {
    var self = this;
    var user = options.user;
    var entity = new miappSdk.Entity({
        client: this._client,
        data: {
            actor: {
                displayName: user.get("username"),
                uuid: user.get("uuid"),
                username: user.get("username"),
                email: user.get("email"),
                picture: user.get("picture"),
                image: {
                    duration: 0,
                    height: 80,
                    url: user.get("picture"),
                    width: 80
                }
            },
            verb: "post",
            content: options.content,
            type: "groups/" + this._path + "/activities"
        }
    });
    entity.save(function (err, response, entity) {
        doCallback(callback, [err, response, self]);
    });
};

/*
 *  A class to model a miappSdk event.
 *
 *  @constructor
 *  @param {object} options {timestamp:0, category:'value', counters:{name : value}}
 *  @returns {callback} callback(err, event)
 */
miappSdk.Counter = function (options) {
    this._client = options.client;
    this._data = options.data || {};
    this._data.category = options.category || "UNKNOWN";
    this._data.timestamp = options.timestamp || 0;
    this._data.type = "events";
    this._data.counters = options.counters || {};
};

var COUNTER_RESOLUTIONS = ["all", "minute", "five_minutes", "half_hour", "hour", "six_day", "day", "week", "month"];

/*
 *  Inherit from miappSdk.Entity.
 *  Note: This only accounts for data on the group object itself.
 *  You need to use add and remove to manipulate group membership.
 */
miappSdk.Counter.prototype = new miappSdk.Entity();

/*
 * overrides Entity.prototype.fetch. Returns all data for counters
 * associated with the object as specified in the constructor
 *
 * @public
 * @method increment
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
miappSdk.Counter.prototype.fetch = function (callback) {
    this.getData({}, callback);
};

/*
 * increments the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method increment
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
miappSdk.Counter.prototype.increment = function (options, callback) {
    var self = this, name = options.name, value = options.value;
    if (!name) {
        return doCallback(callback, [new miappSdkInvalidArgumentError("'name' for increment, decrement must be a number"), null, self], self);
    } else if (isNaN(value)) {
        return doCallback(callback, [new miappSdkInvalidArgumentError("'value' for increment, decrement must be a number"), null, self], self);
    } else {
        self._data.counters[name] = parseInt(value) || 1;
        return self.save(callback);
    }
};

/*
 * decrements the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method decrement
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
miappSdk.Counter.prototype.decrement = function (options, callback) {
    var self = this, name = options.name, value = options.value;
    self.increment({
        name: name,
        value: -(parseInt(value) || 1)
    }, callback);
};

/*
 * resets the counter for a specific event
 *
 * options object: {name: counter_name}
 *
 * @public
 * @method reset
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
miappSdk.Counter.prototype.reset = function (options, callback) {
    var self = this, name = options.name;
    self.increment({
        name: name,
        value: 0
    }, callback);
};

/*
 * gets data for one or more counters over a given
 * time period at a specified resolution
 *
 * options object: {
 *                   counters: ['counter1', 'counter2', ...],
 *                   start: epoch timestamp or ISO date string,
 *                   end: epoch timestamp or ISO date string,
 *                   resolution: one of ('all', 'minute', 'five_minutes', 'half_hour', 'hour', 'six_day', 'day', 'week', or 'month')
 *                   }
 *
 * @public
 * @method getData
 * @params {object} options
 * @param {function} callback
 * @returns {callback} callback(err, event)
 */
miappSdk.Counter.prototype.getData = function (options, callback) {
    var start_time, end_time, start = options.start || 0, end = options.end || Date.now(), resolution = (options.resolution || "all").toLowerCase(), counters = options.counters || Object.keys(this._data.counters), res = (resolution || "all").toLowerCase();
    if (COUNTER_RESOLUTIONS.indexOf(res) === -1) {
        res = "all";
    }
    start_time = getSafeTime(start);
    end_time = getSafeTime(end);
    var self = this;
    var params = Object.keys(counters).map(function (counter) {
        return ["counter", encodeURIComponent(counters[counter])].join("=");
    });
    params.push("resolution=" + res);
    params.push("start_time=" + String(start_time));
    params.push("end_time=" + String(end_time));
    var endpoint = "counters?" + params.join("&");
    this._client.request({
        endpoint: endpoint
    }, function (err, data) {
        if (data.counters && data.counters.length) {
            data.counters.forEach(function (counter) {
                self._data.counters[counter.name] = counter.value || counter.values;
            });
        }
        return doCallback(callback, [err, data, self], self);
    });
};

function getSafeTime(prop) {
    var time;
    switch (typeof prop) {
        case "undefined":
            time = Date.now();
            break;

        case "number":
            time = prop;
            break;

        case "string":
            time = isNaN(prop) ? Date.parse(prop) : parseInt(prop);
            break;

        default:
            time = Date.parse(prop.toString());
    }
    return time;
}

/*
 *  A class to model a miappSdk folder.
 *
 *  @constructor
 *  @param {object} options {name:"MyPhotos", path:"/user/uploads", owner:"00000000-0000-0000-0000-000000000000" }
 *  @returns {callback} callback(err, folder)
 */
miappSdk.Folder = function (options, callback) {
    var self = this, messages = [];
    console.log("FOLDER OPTIONS", options);
    self._client = options.client;
    self._data = options.data || {};
    self._data.type = "folders";
    var missingData = ["name", "owner", "path"].some(function (required) {
        return !(required in self._data);
    });
    if (missingData) {
        return doCallback(callback, [new miappSdkInvalidArgumentError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self], self);
    }
    self.save(function (err, response) {
        if (err) {
            doCallback(callback, [new miappSdkError(response), response, self], self);
        } else {
            if (response && response.entities && response.entities.length) {
                self.set(response.entities[0]);
            }
            doCallback(callback, [null, response, self], self);
        }
    });
};

/*
 *  Inherit from miappSdk.Entity.
 */
miappSdk.Folder.prototype = new miappSdk.Entity();

/*
 *  fetch the folder and associated assets
 *
 *  @method fetch
 *  @public
 *  @param {function} callback(err, self)
 *  @returns {callback} callback(err, self)
 */
miappSdk.Folder.prototype.fetch = function (callback) {
    var self = this;
    miappSdk.Entity.prototype.fetch.call(self, function (err, data) {
        console.log("self", self.get());
        console.log("data", data);
        if (!err) {
            self.getAssets(function (err, response) {
                if (err) {
                    doCallback(callback, [new miappSdkError(response), resonse, self], self);
                } else {
                    doCallback(callback, [null, self], self);
                }
            });
        } else {
            doCallback(callback, [null, data, self], self);
        }
    });
};

/*
 *  Add an asset to the folder.
 *
 *  @method addAsset
 *  @public
 *  @param {object} options {asset:(uuid || miappSdk.Asset || {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }) }
 *  @returns {callback} callback(err, folder)
 */
miappSdk.Folder.prototype.addAsset = function (options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
            case "object":
                asset = options.asset;
                if (!(asset instanceof miappSdk.Entity)) {
                    asset = new miappSdk.Asset(asset);
                }
                break;

            case "string":
                if (isUUID(options.asset)) {
                    asset = new miappSdk.Asset({
                        client: self._client,
                        data: {
                            uuid: options.asset,
                            type: "assets"
                        }
                    });
                }
                break;
        }
        if (asset && asset instanceof miappSdk.Entity) {
            asset.fetch(function (err, data) {
                if (err) {
                    doCallback(callback, [new miappSdkError(data), data, self], self);
                } else {
                    var endpoint = ["folders", self.get("uuid"), "assets", asset.get("uuid")].join("/");
                    var options = {
                        method: "POST",
                        endpoint: endpoint
                    };
                    self._client.request(options, callback);
                }
            });
        }
    } else {
        doCallback(callback, [new miappSdkInvalidArgumentError("No asset specified"), null, self], self);
    }
};

/*
 *  Remove an asset from the folder.
 *
 *  @method removeAsset
 *  @public
 *  @param {object} options {asset:(uuid || miappSdk.Asset || {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }) }
 *  @returns {callback} callback(err, folder)
 */
miappSdk.Folder.prototype.removeAsset = function (options, callback) {
    var self = this;
    if ("asset" in options) {
        var asset = null;
        switch (typeof options.asset) {
            case "object":
                asset = options.asset;
                break;

            case "string":
                if (isUUID(options.asset)) {
                    asset = new miappSdk.Asset({
                        client: self._client,
                        data: {
                            uuid: options.asset,
                            type: "assets"
                        }
                    });
                }
                break;
        }
        if (asset && asset !== null) {
            var endpoint = ["folders", self.get("uuid"), "assets", asset.get("uuid")].join("/");
            self._client.request({
                method: "DELETE",
                endpoint: endpoint
            }, function (err, response) {
                if (err) {
                    doCallback(callback, [new miappSdkError(response), response, self], self);
                } else {
                    doCallback(callback, [null, response, self], self);
                }
            });
        }
    } else {
        doCallback(callback, [new miappSdkInvalidArgumentError("No asset specified"), null, self], self);
    }
};

/*
 *  List the assets in the folder.
 *
 *  @method getAssets
 *  @public
 *  @returns {callback} callback(err, assets)
 */
miappSdk.Folder.prototype.getAssets = function (callback) {
    return this.getConnections("assets", callback);
};

/*
 *  XMLHttpRequest.prototype.sendAsBinary polyfill
 *  from: https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest#sendAsBinary()
 *
 *  @method sendAsBinary
 *  @param {string} sData
 */
if (!XMLHttpRequest.prototype.sendAsBinary) {
    XMLHttpRequest.prototype.sendAsBinary = function (sData) {
        var nBytes = sData.length, ui8Data = new Uint8Array(nBytes);
        for (var nIdx = 0; nIdx < nBytes; nIdx++) {
            ui8Data[nIdx] = sData.charCodeAt(nIdx) & 255;
        }
        this.send(ui8Data);
    };
}

/*
 *  A class to model a miappSdk asset.
 *
 *  @constructor
 *  @param {object} options {name:"photo.jpg", path:"/user/uploads", "content-type":"image/jpeg", owner:"F01DE600-0000-0000-0000-000000000000" }
 *  @returns {callback} callback(err, asset)
 */
miappSdk.Asset = function (options, callback) {
    var self = this, messages = [];
    self._client = options.client;
    self._data = options.data || {};
    self._data.type = "assets";
    var missingData = ["name", "owner", "path"].some(function (required) {
        return !(required in self._data);
    });
    if (missingData) {
        doCallback(callback, [new miappSdkError("Invalid asset data: 'name', 'owner', and 'path' are required properties."), null, self], self);
    } else {
        self.save(function (err, data) {
            if (err) {
                doCallback(callback, [new miappSdkError(data), data, self], self);
            } else {
                if (data && data.entities && data.entities.length) {
                    self.set(data.entities[0]);
                }
                doCallback(callback, [null, data, self], self);
            }
        });
    }
};

/*
 *  Inherit from miappSdk.Entity.
 */
miappSdk.Asset.prototype = new miappSdk.Entity();

/*
 *  Add an asset to a folder.
 *
 *  @method connect
 *  @public
 *  @param {object} options {folder:"F01DE600-0000-0000-0000-000000000000"}
 *  @returns {callback} callback(err, asset)
 */
miappSdk.Asset.prototype.addToFolder = function (options, callback) {
    var self = this, error = null;
    if ("folder" in options && isUUID(options.folder)) {
        var folder = miappSdk.Folder({
            uuid: options.folder
        }, function (err, folder) {
            if (err) {
                doCallback(callback, [miappSdkError.fromResponse(folder), folder, self], self);
            } else {
                var endpoint = ["folders", folder.get("uuid"), "assets", self.get("uuid")].join("/");
                var options = {
                    method: "POST",
                    endpoint: endpoint
                };
                this._client.request(options, function (err, response) {
                    if (err) {
                        doCallback(callback, [miappSdkError.fromResponse(folder), response, self], self);
                    } else {
                        doCallback(callback, [null, folder, self], self);
                    }
                });
            }
        });
    } else {
        doCallback(callback, [new miappSdkError("folder not specified"), null, self], self);
    }
};

miappSdk.Entity.prototype.attachAsset = function (file, callback) {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        doCallback(callback, [new miappSdkError("The File APIs are not fully supported by your browser."), null, this], this);
        return;
    }
    var self = this;
    var args = arguments;
    var type = this._data.type;
    var attempts = self.get("attempts");
    if (isNaN(attempts)) {
        attempts = 3;
    }
    if (type != "assets" && type != "asset") {
        var endpoint = [this._client.URI, this._client.orgName, this._client.appName, type, self.get("uuid")].join("/");
    } else {
        self.set("content-type", file.type);
        self.set("size", file.size);
        var endpoint = [this._client.URI, this._client.orgName, this._client.appName, "assets", self.get("uuid"), "data"].join("/");
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint, true);
    xhr.onerror = function (err) {
        doCallback(callback, [new miappSdkError("The File APIs are not fully supported by your browser.")], xhr, self);
    };
    xhr.onload = function (ev) {
        if (xhr.status >= 500 && attempts > 0) {
            self.set("attempts", --attempts);
            setTimeout(function () {
                self.attachAsset.apply(self, args);
            }, 100);
        } else if (xhr.status >= 300) {
            self.set("attempts");
            doCallback(callback, [new miappSdkError(JSON.parse(xhr.responseText)), xhr, self], self);
        } else {
            self.set("attempts");
            self.fetch();
            doCallback(callback, [null, xhr, self], self);
        }
    };
    var fr = new FileReader();
    fr.onload = function () {
        var binary = fr.result;
        if (type === "assets" || type === "asset") {
            xhr.overrideMimeType("application/octet-stream");
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
        }
        xhr.sendAsBinary(binary);
    };
    fr.readAsBinaryString(file);
};

/*
 *  Upload Asset data
 *
 *  @method upload
 *  @public
 *  @param {object} data Can be a javascript Blob or File object
 *  @returns {callback} callback(err, asset)
 */
miappSdk.Asset.prototype.upload = function (data, callback) {
    this.attachAsset(data, function (err, response) {
        if (!err) {
            doCallback(callback, [null, response, self], self);
        } else {
            doCallback(callback, [new miappSdkError(err), response, self], self);
        }
    });
};

/*
 *  Download Asset data
 *
 *  @method download
 *  @public
 *  @returns {callback} callback(err, blob) blob is a javascript Blob object.
 */
miappSdk.Entity.prototype.downloadAsset = function (callback) {
    var self = this;
    var endpoint;
    var type = this._data.type;
    var xhr = new XMLHttpRequest();
    if (type != "assets" && type != "asset") {
        endpoint = [this._client.URI, this._client.orgName, this._client.appName, type, self.get("uuid")].join("/");
    } else {
        endpoint = [this._client.URI, this._client.orgName, this._client.appName, "assets", self.get("uuid"), "data"].join("/");
    }
    xhr.open("GET", endpoint, true);
    xhr.responseType = "blob";
    xhr.onload = function (ev) {
        var blob = xhr.response;
        if (type != "assets" && type != "asset") {
            doCallback(callback, [null, blob, xhr], self);
        } else {
            doCallback(callback, [null, xhr, self], self);
        }
    };
    xhr.onerror = function (err) {
        callback(true, err);
        doCallback(callback, [new miappSdkError(err), xhr, self], self);
    };
    if (type != "assets" && type != "asset") {
        xhr.setRequestHeader("Accept", self._data["file-metadata"]["content-type"]);
    } else {
        xhr.overrideMimeType(self.get("content-type"));
    }
    xhr.send();
};

/*
 *  Download Asset data
 *
 *  @method download
 *  @public
 *  @returns {callback} callback(err, blob) blob is a javascript Blob object.
 */
miappSdk.Asset.prototype.download = function (callback) {
    this.downloadAsset(function (err, response) {
        if (!err) {
            doCallback(callback, [null, response, self], self);
        } else {
            doCallback(callback, [new miappSdkError(err), response, self], self);
        }
    });
};

(function (global) {
    var name = "miappSdkError", short, _name = global[name], _short = short && short !== undefined ? global[short] : undefined;
    /*
     *  Instantiates a new miappSdkError
     *
     *  @method miappSdkError
     *  @public
     *  @params {<string>} message
     *  @params {<string>} id       - the error code, id, or name
     *  @params {<int>} timestamp
     *  @params {<int>} duration
     *  @params {<string>} exception    - the Java exception from miappSdk
     *  @return Returns - a new miappSdkError object
     *
     *  Example:
     *
     *  miappSdkError(message);
     */
    function miappSdkError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }

    miappSdkError.prototype = new Error();
    miappSdkError.prototype.constructor = miappSdkError;
    /*
     *  Creates a miappSdkError from the JSON response returned from the backend
     *
     *  @method fromResponse
     *  @public
     *  @params {object} response - the deserialized HTTP response from the miappSdk API
     *  @return Returns a new miappSdkError object.
     *
     *  Example:
     *  {
     *  "error":"organization_application_not_found",
     *  "timestamp":1391618508079,
     *  "duration":0,
     *  "exception":"org.miappSdk.rest.exceptions.OrganizationApplicationNotFoundException",
     *  "error_description":"Could not find application for yourorgname/sandboxxxxx from URI: yourorgname/sandboxxxxx"
     *  }
     */
    miappSdkError.fromResponse = function (response) {
        if (response && "undefined" !== typeof response) {
            return new miappSdkError(response.error_description, response.error, response.timestamp, response.duration, response.exception);
        } else {
            return new miappSdkError();
        }
    };
    miappSdkError.createSubClass = function (name) {
        if (name in global && global[name]) return global[name];
        global[name] = function () {
        };
        global[name].name = name;
        global[name].prototype = new miappSdkError();
        return global[name];
    };
    function miappSdkHTTPResponseError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }

    miappSdkHTTPResponseError.prototype = new miappSdkError();
    function miappSdkInvalidHTTPMethodError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_http_method";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }

    miappSdkInvalidHTTPMethodError.prototype = new miappSdkError();
    function miappSdkInvalidURIError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_uri";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }

    miappSdkInvalidURIError.prototype = new miappSdkError();
    function miappSdkInvalidArgumentError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name || "invalid_argument";
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }

    miappSdkInvalidArgumentError.prototype = new miappSdkError();
    function miappSdkKeystoreDatabaseUpgradeNeededError(message, name, timestamp, duration, exception) {
        this.message = message;
        this.name = name;
        this.timestamp = timestamp || Date.now();
        this.duration = duration || 0;
        this.exception = exception;
    }

    miappSdkKeystoreDatabaseUpgradeNeededError.prototype = new miappSdkError();
    global.miappSdkHTTPResponseError = miappSdkHTTPResponseError;
    global.miappSdkInvalidHTTPMethodError = miappSdkInvalidHTTPMethodError;
    global.miappSdkInvalidURIError = miappSdkInvalidURIError;
    global.miappSdkInvalidArgumentError = miappSdkInvalidArgumentError;
    global.miappSdkKeystoreDatabaseUpgradeNeededError = miappSdkKeystoreDatabaseUpgradeNeededError;
    global[name] = miappSdkError;
    if (short !== undefined) {
        global[short] = miappSdkError;
    }
    global[name].noConflict = function () {
        if (_name) {
            global[name] = _name;
        }
        if (short !== undefined) {
            global[short] = _short;
        }
        return miappSdkError;
    };
    return global[name];
})(this || window);

var SrvMiapp = (function () {
    'use strict';

    function Service(logger, promise) {

        this.logger = logger;
        this.promise = promise;
        //this.$q = $q;
        //this.$timeout = $timeout;
        this.logger.log('miapp.sdk.service : init');
        //self.logger.log('miapp.sdk.service : init');

        this.miappClient = null;
        this.currentUser = getObjectFromLocalStorage('miappCurrentUser') || null;

        this.miappId = null;
        this.miappSalt = 'miappDefaultSalt';
        this.miappOrg = 'miapp.io';
        this.miappAppVersion = 'draft';
        //this.miappTestURI = null;

        this.miappIsOffline = getObjectFromLocalStorage('miappIsOffline') || false;
        this.miappURL = getObjectFromLocalStorage('miappURL') || 'https://miapp.io/api';
        this.miappDBURL = getObjectFromLocalStorage('miappDBURL') || 'https://couchdb01.miapp.io';
        this.miappAuthEndDate = new Date();
        this.miappAuthEndDate.setMonth(this.miappAuthEndDate.getMonth() + 1);
        var ls = getObjectFromLocalStorage('miappAuthEndDate');
        //console.log(ls);
        var miappAuthEndDate = ls;// ? JSON.parse(ls) : null;
        if (miappAuthEndDate) this.miappAuthEndDate = new Date(miappAuthEndDate);

        this._db = new PouchDB('miapp_db', {adapter: 'websql'});
        this._dbRecordCount = 0;
        this._dbInitialized = false;
    }

    Service.prototype.init = function (miappId, miappSalt, forceOnline) {

        this.logger.log('miapp.sdk.service.init : ' + miappId + ' ? ' + forceOnline);
        //self.logger.log('miapp.sdk.service.init : ' + miappId + ' ? ' + forceOnline);
        this.miappIsOffline = (typeof forceOnline === 'undefined') ? this.miappIsOffline : !forceOnline;
        if (!this.miappIsOffline) {
            this.miappClient = new miappSdk.Client({
                orgName: 'miappio',
                appName: miappId,
                logging: true, // Optional - turn on logging, off by default
                buildCurl: false, // Optional - turn on curl commands, off by default
                URI: this.miappURL
            });
        }

        this.miappId = miappId;
        this.miappSalt = miappSalt;
        //TODO autoupdate this.miappOrg && this.miappAppVersion

    };

    Service.prototype.setAuthEndpoint = function (endpointURI) {
        this.miappURL = endpointURI;
        if (this.miappURL) setObjectFromLocalStorage('miappURL', this.miappURL);
        if (this.miappClient && this.miappURL) this.miappClient.setMiappURL(this.miappURL);
    };

    Service.prototype.setDBEndpoint = function (endpointURI) {
        this.miappDBURL = endpointURI;
        if (this.miappDBURL) setObjectFromLocalStorage('miappDBURL', this.miappDBURL);
    };
    Service.prototype.setAuthEndDate = function (endDate) {
        this.miappAuthEndDate = endDate;
        if (this.miappAuthEndDate) setObjectFromLocalStorage('miappAuthEndDate', this.miappAuthEndDate);
    };


    Service.prototype.setOffline = function (b) {
        this.miappIsOffline = (b == true);
        setObjectFromLocalStorage('miappIsOffline', this.miappIsOffline);
    };

    Service.prototype.isLogin = function () {
        if (!this.currentUser) return false;
        return true;
    };

    Service.prototype.login = function (login, password, updateProperties) {
        var self = this;
        return new self.promise(function (resolve, reject) {
                if (!self.miappClient && !self.miappIsOffline) {
                    reject('miapp.sdk.service.login : not initialized. Did you miapp.sdk.service.init() ?');
                    return;
                }

                //TODO password encrypting and salt stuff
                //var encrypted = CryptoJS.AES.encrypt(password, 'SALT_TOKEN');
                //var encrypted_json_str = encrypted.toString();
                var encrypted_json_str = password;
                self.logger.log('miapp.sdk.service.login : ' + login + ' / ' + encrypted_json_str);

            if (!self.miappClient || self.miappIsOffline || !miapp.BrowserCapabilities.isConnectionOnline()) {
                    var offlineUser = {};
                    if (login) offlineUser.email = login;
                    if (encrypted_json_str) offlineUser.password = encrypted_json_str;
                    self.setCurrentUser(offlineUser);
                    resolve(self.currentUser);
                    return;
                }


            var fullLogin = function () {

                    // Check a full Login
                    self.logger.log('miapp.sdk.service.login Check Full Login');

                // Need a refresh token
                self.miappClient.logout();
                if (self.currentUser && self.currentUser.access_token)
                    delete self.currentUser.access_token;

                    self.miappClient.loginMLE(self.miappId, login, encrypted_json_str, updateProperties, function (err, loginUser) {
                        // self.logger.log('miapp.sdk.service.login done :' + err + ' user:' + user);
                        if (err || !loginUser) {
                            // Error - could not log user in
                            self.logger.error('miapp.sdk.service.login error : ' + err);
                            //self.miappIsOffline = true;
                            return reject(err);
                        }

                        // Success - user has been logged in
                        loginUser.email = login;

                        // get miapp endpoints
                        if (loginUser.miappURL) self.setAuthEndpoint(loginUser.miappURL);
                        if (loginUser.miappDBURL) self.setDBEndpoint(loginUser.miappDBURL);
                        if (loginUser.miappNeedRefresh) self.setAuthEndDate(loginUser.miappNeedRefresh);
                        delete loginUser.miappURL;
                        delete loginUser.miappDBURL;
                        delete loginUser.miappNeedRefresh;

                        // store it
                        self.setCurrentUser(loginUser);

                        resolve(self.currentUser);

                    });
            };


            var sameUser = self.currentUser && (self.currentUser.email === login && self.currentUser.password === encrypted_json_str);
            var noUser = (!login && !password);
            if (self.currentUser && self.currentUser.access_token && (noUser || sameUser)) {
                login = self.currentUser.email;
                //todo ! encrypted_json_str = self.currentUser.password;

                // Check Token
                self.logger.log('miapp.sdk.service.login Check Token');
                self.miappClient.reAuthenticateMLE(function (err) {
                    if (err) {
                        // Error - could not reLog user in
                        self.logger.error('miapp.sdk.service.login Check Token error : ' + err);
                        if (!noUser)
                            fullLogin();
                        else
                            reject('Need to login again ...');
                    }
                    else {
                            resolve(self.currentUser);
                        }
                    });
                }
            else {
                fullLogin();
            }

            }
        );
    };

    Service.prototype.logoff = function () {
        var self = this;
        if (!self.currentUser) return self.promise.reject('miapp.sdk.service not login');

        self.currentUser = null;
        removeObjectFromLocalStorage('miappCurrentUser');
        return self.becarefulCleanDb();

        //return self.deleteUser(self.currentUser._id);
    };

    Service.prototype.deleteUser = function (userIDToDelete) {
        var self = this;
        if (self.miappIsOffline) {
            return self.promise.resolve(null);
        }

        if (!self.miappClient) {
            return self.promise.reject('miapp.sdk.service not initialized');
        }

        return new self.promise(function (resolve, reject) {
            self.miappClient.deleteUserMLE(userIDToDelete, function (err) {
                // self.logger.log('miapp.sdk.service.deleteUserMLE callback done :' + err);
                if (err) {
                    // Error - could not log user in
                    return reject(err);
                }
                return resolve();
            });
        });
    };

    Service.prototype.syncDb = function () {
        var self = this;
        self.logger.log('miapp.sdk.service.syncDb');

        if (self.miappIsOffline) {
            return self.promise.resolve();
        }

        var pouchdbEndpoint = self.miappDBURL;
        var getendpoint = self.miappClient ? self.miappClient.getEndpoint() : null;
        if (!pouchdbEndpoint && getendpoint) pouchdbEndpoint = getendpoint;
        if (!self.currentUser || !self.currentUser.email || !pouchdbEndpoint || !self._db || !self._db.sync)
            return self.promise.reject('miapp.sdk.service.syncDb : DB sync impossible. Need a user logged in. (' + pouchdbEndpoint + ' -' + self.currentUser + ')');

        self.logger.log('miapp.sdk.service.syncDb call');

        return new self.promise(function (resolve, reject) {
            try {
                self._db
                    .sync(pouchdbEndpoint, {
                        filter: function (doc) {
                            // No data if no currentUser set up
                            //if (doc.appUser_Id == self.currentUser.email) return doc;
                            if (!self.currentUser || !self.currentUser._id) return;
                            if (doc.miappUserId === self.currentUser._id) return doc;
                        }
                    })
                    .on('complete', function (info) {
                        self.logger.log('miapp.sdk.service.syncDb : db complete : ' + info);
                        resolve();
                    })
                    .on('error', function (err) {
                        self.logger.error('miapp.sdk.service.syncDb : db error, we set db temporary offline : ' + err);
                        self.miappIsOffline = true;
                        reject('Connection problem  ...');
                    })
                    .on('change', function (info) {
                        self.logger.log('miapp.sdk.service.syncDb : db change : ' + info);
                    })
                    .on('paused', function (err) {
                        self.logger.log('miapp.sdk.service.syncDb : db paused : ' + err);
                    })
                    .on('active', function () {
                        self.logger.log('miapp.sdk.service.syncDb : db activate');
                    })
                    .on('denied', function (info) {
                        self.logger.error('miapp.sdk.service.syncDb : db denied, we set db temporary offline_ : ' + info);
                        self.miappIsOffline = true;
                        reject('miapp.sdk.service.syncDb : db denied : ' + info);
                    });
            }
            catch (err) {
                reject('miapp.sdk.service.syncDb : erreur catched : ' + err)
            }
        });

    };

    Service.prototype.putInDb = function (data) {
        var self = this;
        self.logger.log('miapp.sdk.service.putInDb');
        self.logger.log(data);

        if (!self.currentUser || !self.currentUser._id || !self._db)
            return self.promise.reject('miapp.sdk.service.putInDb : DB put impossible. Need a user logged in. (' + self.currentUser + ')');

        data.miappUserId = self.currentUser._id;
        data.miappOrgId = self.miappOrg;
        data.miappAppVersion = self.miappAppVersion;

        var dataId = data._id;
        if (!dataId) dataId = _generateObjectUniqueId(self.appName);
        delete data._id;
        data._id = dataId;
        return new self.promise(function (resolve, reject) {
            self._db.put(data, function (err, response) {
                if (response && response.ok && response.id && response.rev) {
                    data._id = response.id;
                    data._rev = response.rev;
                    self._dbRecordCount++;
                    self.logger.log("updatedData: " + data._id + " - " + data._rev);
                    resolve(data);
                    return;
                }
                reject(err);
            });
        });

    };

    Service.prototype.findInDb = function (id) {
        var self = this;

        if (!self.currentUser || !self.currentUser._id || !self._db)
            return self.promise.reject('miapp.sdk.service.findInDb : need a user logged in. (' + self.currentUser + ')');

        return self._db.get(id);
    };

    Service.prototype.findAllInDb = function () {
        var self = this;

        if (!self.currentUser || !self.currentUser._id || !self._db)
            return self.promise.reject('miapp.sdk.service.findAllInDb : need a user logged in. (' + self.currentUser + ')');

        return self._db.allDocs({include_docs: true, descending: true});
    };

    Service.prototype.isDbEmpty = function () {
        var self = this;
        self.logger.log('miapp.sdk.service.isDbEmpty ..');
        if (!self._db) {//if (!self.currentUser || !self.currentUser.email || !pouchDB) {
            var error = 'miapp.sdk.service.isDbEmpty : DB search impossible. Need a user logged in. (' + self.currentUser + ')';
            self.logger.error(error);
            return self.promise.reject(error);
        }

        self.logger.log('miapp.sdk.service.isDbEmpty call');
        return new self.promise(function (resolve, reject) {
            self._db.allDocs({
                //filter: function (doc) {
                //    if (!self.currentUser || !self.currentUser._id) return doc;
                //    if (doc.miappUserId === self.currentUser._id) return doc;
                //}
            }, function (err, response) {
                self.logger.log('miapp.sdk.service.isDbEmpty callback');
                if (err || !response) {
                    reject(err);
                    return;
                }

                self._dbRecordCount = response.total_rows;
                //if (response && response.total_rows && response.total_rows > 5) return resolve(false);
                if (response.total_rows && response.total_rows > 0) {
                    resolve(false);
                    return;
                }

                self.logger.log('miapp.sdk.service.isDbEmpty callback: ' + response.total_rows);
                resolve(true);

            });
        });
    };

    Service.prototype.setCurrentUser = function (user) {
        var self = this;
        if (!user)
            return self.logger.log('miapp.sdk.service.setCurrentUser : need a valid user');

        // Set a currentUser
        if (!self.currentUser) self.currentUser = {};

        // Look for an unique id
        var firstUserId = user._id;
        if (!firstUserId) firstUserId = self.currentUser._id;
        if (!firstUserId) firstUserId = _generateObjectUniqueId(self.miappAppVersion, 'user');

        user._id = firstUserId;
        user.miappUserId = firstUserId;
        user.miappOrgId = self.miappOrgId;
        user.miappAppVersion = self.miappAppVersion;

        // Merge from stored currentUser and user gave in
        //self.logger.log(self.currentUser);
        for (var attrname in user) {
            //self.logger.log('' + attrname + ' = ' + user[attrname]);
            if (user[attrname]) self.currentUser[attrname] = user[attrname];
        }

        // Delete and don't store some fields : _rev ...
        delete self.currentUser._rev;

        // store it
        setObjectFromLocalStorage('miappCurrentUser', self.currentUser);
        self.logger.log('miapp.sdk.service.setCurrentUser :', self.currentUser);
    };

    // used ?
    Service.prototype.putFirstUserInEmptyDb = function (firstUser) {
        var self = this;
        self.logger.log('miapp.sdk.service.putFirstUserInEmptyBd');
        if (!firstUser || !self.currentUser || !self.currentUser.email || !self._db || !self._db.put)
            return self.promise.reject('miapp.sdk.service.putFirstUserInEmptyBd : DB put impossible. Need a user logged in. (' + self.currentUser + ')_');

        var firstUserId = firstUser._id;
        if (!firstUserId) firstUserId = self.currentUser._id;
        if (!firstUserId) firstUserId = _generateObjectUniqueId(self.appName, 'user');

        firstUser.miappUserId = firstUserId;
        firstUser.miappOrgId = self.miappOrg;
        firstUser.miappAppVersion = self.miappAppVersion;
        delete firstUser._id;
        firstUser._id = firstUserId;

        return new self.promise(function (resolve, reject) {
            try {
                self.logger.log('miapp.sdk.service.putFirstUserInEmptyBd : put ...');
                self._db.put(firstUser)
                    .then(function (response) {

                        self.logger.log('miapp.sdk.service.putFirstUserInEmptyBd : then ...');

                        if (response && response.ok && response.id && response.rev) {
                            firstUser._id = response.id;
                            firstUser._rev = response.rev;
                            self.logger.log('miapp.sdk.service.putFirstUserInEmptyBd : firstUser: ' + firstUser._id + ' - ' + firstUser._rev);

                            self._dbRecordCount++;
                            self.setCurrentUser(firstUser);
                            resolve(firstUser);
                        }
                        else {
                            reject('miapp.sdk.service.putFirstUserInEmptyBd : bad response');
                        }
                    })
                    .catch(function (err) {
                        self.logger.log('miapp.sdk.service.putFirstUserInEmptyBd : catched : ' + err);
                        reject(err);
                    });
            }
            catch (err) {
                self.logger.log('miapp.sdk.service.putFirstUserInEmptyBd : catched ...: ' + err);
                reject(err);
            }
        });
    };

    Service.prototype.becarefulCleanDb = function () {
        var self = this;
        self.logger.log('miapp.sdk.service.becarefulCleanDb');
        if (!self._db || !self._db.destroy)
            return self.promise.reject('miapp.sdk.service.becarefulCleanDb : DB clean impossible.');

        return new self.promise(function (resolve, reject) {

            self._db.destroy(function (err, info) {
                if (err) return reject(err);

                self._db = new PouchDB('miapp_db', {adapter: 'websql'});

                // Do we need to remove CurrentUser ?
                //delete self.currentUser;
                //self.currentUser = null;
                //removeObjectFromLocalStorage('miappCurrentUser');

                self._dbRecordCount = 0;
                self.logger.log('miapp.sdk.service.becarefulCleanDb .. done : ' + info);
                return resolve();
            });
        });
    };

    // Call it on each app start
    // Set User login in DB if db empty
    // Return self.promise with this._db
    Service.prototype.initDBWithLogin = function (login, password, forceOnline) {
        var self = this;
        self.logger.log('miapp.sdk.service.initDBWithLogin');

        var now = new Date();
        var isDeprecated = (self.miappAuthEndDate < now);
        self.logger.log('miapp.sdk.service.initDBWithLogin : is isDeprecated ? ', isDeprecated);

        if (self._dbInitialized && self.currentUser && !forceOnline && !isDeprecated)
            return self.promise.resolve(self.currentUser);

        if (forceOnline || isDeprecated) self.setOffline(false);

        return new self.promise(function (resolve, reject) {

            self.isDbEmpty()
                .then(function (isEmpty) {


                    self.logger.log('miapp.sdk.service.initDBWithLogin : is empty ? ', isEmpty);

                    // We force login and syncDB : force or first time
                    if (forceOnline || isDeprecated) {
                        self.logger.log('miapp.sdk.service.initDBWithLogin : self.miappAuthEndDate ? ', self.miappAuthEndDate);
                        self.login(login, password)
                            .then(function (firstUser) {
                                if (firstUser) {
                                    self.logger.log('miapp.sdk.service.initDBWithLogin : login done for the first time.');
                                    self.setCurrentUser(firstUser);
                                }
                                self.syncDb()
                                    .finally(function (ret) {
                                        self.logger.log('miapp.sdk.service.initDBWithLogin : self.currentUser', self.currentUser);
                                        if (!self.currentUser) {
                                            reject('miapp.sdk.service.initDBWithLogin : Pb with user get.' + ret);
                                        }
                                        else {
                                            self._dbInitialized = true;
                                            resolve(self.currentUser);
                                        }
                                    });
                            })
                            .catch(function (err) {
                                var errMsg = 'miapp.sdk.service.initDBWithLogin : ' + err;
                                self.logger.error(errMsg);
                                reject(errMsg);
                            });
                        return;
                    }

                    // DB already initialized
                    if (!isEmpty && self.currentUser) {

                        self.logger.log('miapp.sdk.service.initDBWithLogin : self.miappAuthEndDate ? ', self.miappAuthEndDate);
                        self._dbInitialized = true
                        resolve(self.currentUser); // already set
                        return;
                    }

                    // ELSE : Back from root > clean DB and login
                    self.becarefulCleanDb()
                        .then(function (msg) {
                            //self.logger.log(self.currentUser);
                            return self.login(login, password);
                        })
                        .then(function (firstUser) {
                            self.logger.log(self.currentUser);
                            if (firstUser && !self.currentUser) {
                                self.logger.log('miapp.sdk.service.initDBWithLogin : login done for the first time..');
                                self.setCurrentUser(firstUser);
                                //self.putFirstUserInEmptyDb(firstUser);
                            }

                            self.logger.log('miapp.sdk.service.initDBWithLogin : sync DB...');
                            //self.logger.log(self.currentUser);

                            // do not trap db pb : set as offline
                            self.syncDb()
                                .finally(function (ret) {

                                    self.logger.log(self.currentUser);
                                    if (!self.currentUser) {
                                        reject('miapp.sdk.service.initDBWithLogin : Pb with user get.' + ret);
                                    }
                                    else {
                                        self._dbInitialized = true;
                                        resolve(self.currentUser);
                                    }
                                });
                        })
                        .catch(function (err) {
                            self.logger.error('miapp.sdk.service.initDBWithLogin : err ..: ', err);
                            reject(err);
                        });
                })
                .catch(function (err) {
                    self.logger.error('miapp.sdk.service.initDBWithLogin : err : ', err);
                    reject(err);
                });
        });


    };

    // Sync Data
    // If empty call fnInitFirstData(this._db), should return self.promise to call sync
    // Return self.promise with this._db
    Service.prototype.syncComplete = function (fnInitFirstData, service, forceOnline) {
        var self = this;
        self.logger.log('miapp.sdk.service.syncComplete');
        if (!self.currentUser || !self._db)
            return self.promise.reject('miapp.sdk.service.syncComplete : DB sync impossible. Did you miapp.sdk.service.login() ?');

        if (forceOnline) self.setOffline(false);

        return new self.promise(function (resolve, reject) {
            self.isDbEmpty()
                .then(function (isEmpty) {
                    if (isEmpty && fnInitFirstData) {
                        var ret = fnInitFirstData(service);
                        if (ret && ret["catch"] instanceof Function) return ret;
                        if (typeof ret === 'string') self.logger.log(ret);
                    }
                    return self.promise.resolve('miapp.sdk.service.syncComplete : ready to sync');
                })
                .then(function (ret) {
                    if (typeof ret === 'string') self.logger.log(ret);
                    return self.syncDb();
                })
                .then(function (err) {
                    if (err) return reject(err);
                    self.logger.log('miapp.sdk.service.syncComplete sync resolved');
                    return self._db.info();
                })
                .then(function (result) {
                    self._dbRecordCount = 0;
                    if (result && result.doc_count) self._dbRecordCount = result.doc_count;
                    self.logger.log('miapp.sdk.service.syncComplete _dbRecordCount : ' + self._dbRecordCount);
                    resolve(self._dbRecordCount);
                })
                .catch(function (err) {
                    var errMessage = 'miapp.sdk.service.syncComplete : DB pb with getting data (' + err + ')';
                    //self.logger.error(errMessage);
                    reject(errMessage);
                })
            ;
        });
    };

    Service.prototype._testPromise = function (a) {
        if (a) return this.promise.resolve('test promise ok ' + a);
        return new this.promise(function (resolve, reject) {
            resolve('test promise ok');
        });
    };

    //Local Storage Utilities
    function setObjectFromLocalStorage(id, object) {
        //if(typeof(Storage) === "undefined") return null;
        var jsonObj = JSON.stringify(object);
        if (window.localStorage) window.localStorage.setItem(id, jsonObj);
        //this.logger.log('miapp.sdk.service.retrievedObject: ', JSON.parse(retrievedObject));
        return jsonObj;
    }

    function getObjectFromLocalStorage(id) {
        //if(typeof(Storage) === "undefined") return null;
        // Retrieve the object from storage
        var retrievedObject;
        if (window.localStorage) retrievedObject = window.localStorage.getItem(id);
        var obj = JSON.parse(retrievedObject);
        //this.logger.log('miapp.sdk.service.retrievedObject: ', JSON.parse(retrievedObject));
        return obj;
    }

    function removeObjectFromLocalStorage(id) {
        if (window.localStorage) window.localStorage.removeItem(id);
    }

    //TODO utilities : static removeAll in localStorage ?
    function removeAllObjects() {
        window.localStorage.removeItem('miappCurrentUser');
        window.localStorage.removeItem('miappIsOffline');
        window.localStorage.removeItem('miappURL');
        window.localStorage.removeItem('miappDBURL');
    }

    var _srvDataUniqId = 0;

    function _generateObjectUniqueId(appName, type, name) {

        //return null;
        var now = new Date();
        var simpleDate = "" + now.getYear() + "" + now.getMonth() + "" + now.getDate() + "" + now.getHours() + "" + now.getMinutes();//new Date().toISOString();
        var sequId = ++_srvDataUniqId;
        var UId = '';
        if (appName && appName.charAt(0)) UId += appName.charAt(0) + '';
        if (type && type.length > 3) UId += type.substring(0, 4);
        if (name && name.length > 3) UId += name.substring(0, 4);
        UId += simpleDate + '' + sequId;
        return UId;
    }

    return Service;
})();
