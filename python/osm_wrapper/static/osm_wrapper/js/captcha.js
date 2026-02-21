/**
 * Cellular automaton "CAPTCHA" solver.
 * @param {number[]} original - The original array (key).
 * @param {number[]} proof - The target state to match.
 * @param {number} keySize - The size of the key.
 * @param {number} stateSize - The size of the state.
 * @param {number} simplicityFactor - Simplicity factor
 * @param {number} smallIters - Amount of iterations to find the proof.
 * @param {number} BigIters - Amount of iterations to solve the challenge.
 * @returns {number[]|boolean} - The resulting state if found, otherwise false.
 */
function solve(pkg) {
    let original = pkg.original;
    let proof = pkg.proof;
    let keySize = pkg.key_size;
    let stateSize = pkg.state_size;
    let simplicityFactor = pkg.simplicity_factor;
    let smallIters = pkg.small_iters;
    let bigIters = pkg.big_iters;
    // Initialize the state as an array of zeros.
    const initialState = new Array(2 ** stateSize).fill(0);
    initialState[1] = 1;

    const newSize = keySize - simplicityFactor;
    const maxTrials = 2 ** (newSize * newSize - 1);

    for (let trial = 0; trial < maxTrials; trial++) {
        // Convert trial to binary string, pad with zeros, and convert to array of bits.
        const subkey = trial.toString(2)
            .padStart(2 ** newSize, '0')
            .split('')
            .map(bit => parseInt(bit, 10));

        // Update the original array with the subkey.
        for (let i = 0; i < subkey.length; i++) {
            original[i * (2 ** simplicityFactor)] = subkey[i];
        }

        const automaton = new CellularAutomaton(keySize, original, true);

        let current = [...initialState];
        for (let i = 0; i < smallIters; i++) {
            current = automaton.iterate(current, false);
        }

        // Check if current matches proof.
        if (current.every((val, idx) => val === proof[idx])) {
            for (let i = 0; i < bigIters - smallIters; i++) {
                current = automaton.iterate(current, false);
            }
            return current;
        }
    }
    return false;
}

class CellularAutomaton {
    constructor(size, key) {
        this.size = size;
        this.key = key;
        this._hash = {};
        this._initializeHash();
    }

    combinations() {
        return 2 ** this.size;
    }

    getKey() {
        return this.key;
    }

    _initializeHash() {
        const items = this.combinations();
        for (let i = 0; i < items; i++) {
            const binaryStr = i.toString(2).padStart(this.size, '0');
            this._hash[binaryStr] = this.key[i];
        }
    }

    iterate(seq) {
        const originalLen = seq.length;
        const s = Math.floor(this.size / 2);
        const res = [];
        const end = seq.slice(-s);
        const start = seq.slice(0, s);
        const extendedSeq = [...end, ...seq, ...start];

        for (let i = 0; i < originalLen; i++) {
            const portion = extendedSeq.slice(i, i + this.size);
            const key = portion.join('');
            res.push(this._hash[key]);
        }
        return res;
    }
}