/**
 * 🗳️ Panchayat Election System - Capstone
 *
 * Village ki panchayat election ka system bana! Yeh CAPSTONE challenge hai
 * jisme saare function concepts ek saath use honge:
 * closures, callbacks, HOF, factory, recursion, pure functions.
 *
 * Functions:
 *
 *   1. createElection(candidates)
 *      - CLOSURE: private state (votes object, registered voters set)
 *      - candidates: array of { id, name, party }
 *      - Returns object with methods:
 *
 *      registerVoter(voter)
 *        - voter: { id, name, age }
 *        - Add to private registered set. Return true.
 *        - Agar already registered or voter invalid, return false.
 *        - Agar age < 18, return false.
 *
 *      castVote(voterId, candidateId, onSuccess, onError)
 *        - CALLBACKS: call onSuccess or onError based on result
 *        - Validate: voter registered? candidate exists? already voted?
 *        - If valid: record vote, call onSuccess({ voterId, candidateId })
 *        - If invalid: call onError("reason string")
 *        - Return the callback's return value
 *
 *      getResults(sortFn)
 *        - HOF: takes optional sort comparator function
 *        - Returns array of { id, name, party, votes: count }
 *        - If sortFn provided, sort results using it
 *        - Default (no sortFn): sort by votes descending
 *
 *      getWinner()
 *        - Returns candidate object with most votes
 *        - If tie, return first candidate among tied ones
 *        - If no votes cast, return null
 *
 *   2. createVoteValidator(rules)
 *      - FACTORY: returns a validation function
 *      - rules: { minAge: 18, requiredFields: ["id", "name", "age"] }
 *      - Returned function takes a voter object and returns { valid, reason }
 *
 *   3. countVotesInRegions(regionTree)
 *      - RECURSION: count total votes in nested region structure
 *      - regionTree: { name, votes: number, subRegions: [...] }
 *      - Sum votes from this region + all subRegions (recursively)
 *      - Agar regionTree null/invalid, return 0
 *
 *   4. tallyPure(currentTally, candidateId)
 *      - PURE FUNCTION: returns NEW tally object with incremented count
 *      - currentTally: { "cand1": 5, "cand2": 3, ... }
 *      - Return new object where candidateId count is incremented by 1
 *      - MUST NOT modify currentTally
 *      - If candidateId not in tally, add it with count 1
 *
 * @example
 *   const election = createElection([
 *     { id: "C1", name: "Sarpanch Ram", party: "Janata" },
 *     { id: "C2", name: "Pradhan Sita", party: "Lok" }
 *   ]);
 *   election.registerVoter({ id: "V1", name: "Mohan", age: 25 });
 *   election.castVote("V1", "C1", r => "voted!", e => "error: " + e);
 *   // => "voted!"
 */

export function createElection(candidates) {
  const registeredVoters = new Map(); 
  const votedSet = new Set();         
  const candidateTally = {};          
  
  candidates.forEach(candidate => {
    candidateTally[candidate.id] = 0;
  });

  return {
    registerVoter(voter) {
      if (!voter || !voter.id || !voter.name || typeof voter.age !== 'number') return false;
      if (voter.age < 18) return false;
      
      if (registeredVoters.has(voter.id)) return false;

      registeredVoters.set(voter.id, voter);
      return true;
    },

    castVote(voterId, candidateId, onSuccess, onError) {
      if (!registeredVoters.has(voterId)) {
        return onError("Voter is not registered");
      }
      if (votedSet.has(voterId)) {
        return onError("Voter has already cast their vote");
      }
      if (candidateTally[candidateId] === undefined) {
        return onError("Invalid candidate ID");
      }

      votedSet.add(voterId);
      candidateTally[candidateId]++;

      return onSuccess({ voterId, candidateId });
    },

    getResults(sortFn) {
      const results = candidates.map(c => ({
        ...c,
        votes: candidateTally[c.id]
      }));

      if (typeof sortFn === 'function') {
        return results.sort(sortFn);
      }
      return results.sort((a, b) => b.votes - a.votes);
    },

    getWinner() {
      if (votedSet.size === 0) return null;

      const results = this.getResults();
      
      return results[0];
    }
  };
}

export function createVoteValidator(rules) {
  return function validateVoter(voter) {
    if (!voter || typeof voter !== 'object') {
      return { valid: false, reason: "Invalid voter data" };
    }

    if (rules.requiredFields) {
      for (const field of rules.requiredFields) {
        if (!(field in voter)) {
          return { valid: false, reason: `Missing required field: ${field}` };
        }
      }
    }

    if (rules.minAge !== undefined && voter.age < rules.minAge) {
      return { valid: false, reason: `Voter must be at least ${rules.minAge} years old` };
    }

    return { valid: true, reason: "" };
  };
}

export function countVotesInRegions(regionTree) {
  if (!regionTree || typeof regionTree !== 'object') {
    return 0;
  }

  let totalVotes = typeof regionTree.votes === 'number' ? regionTree.votes : 0;

  if (Array.isArray(regionTree.subRegions)) {
    for (const subRegion of regionTree.subRegions) {
      totalVotes += countVotesInRegions(subRegion);
    }
  }

  return totalVotes;
}

export function tallyPure(currentTally, candidateId) {
  const previousTallySafe = currentTally || {};
  
  return {
    ...previousTallySafe,
    [candidateId]: (previousTallySafe[candidateId] || 0) + 1
  };
}
