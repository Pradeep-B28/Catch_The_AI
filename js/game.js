// Manages round state transitions across typing, playing, revealed, and done phases.
// Uses no DOM dependencies; takes challenges and inputs, emitting state outputs.
// Used by play screen controller, demo mode, and self-test suite.

/**
 * Creates a new headless game instance for managing a round.
 * @returns {object}
 */
export function createGame() {
  let packId = "";
  let challenges = [];
  let currentIndex = 0;
  let step = "idle"; // "idle" | "typing" | "playing" | "revealed" | "done"
  let selectedLine = null;
  let results = [];

  function startRound(pack, challengeList) {
    packId = pack;
    challenges = [...challengeList];
    currentIndex = 0;
    step = "typing";
    selectedLine = null;
    results = [];
    return getState();
  }

  function finishTyping() {
    if (step === "typing") {
      step = "playing";
    }
    return getState();
  }

  function selectLine(line) {
    if (step === "playing") {
      selectedLine = Number(line);
    }
    return getState();
  }

  function lockAnswer(seconds = 0) {
    if (step !== "playing" || selectedLine === null) {
      return null;
    }
    const current = challenges[currentIndex];
    const isCaught = selectedLine === current.bugLine;
    const outcome = {
      id: current.id,
      index: currentIndex,
      pickedLine: selectedLine,
      result: isCaught ? "caught" : "wrong",
      seconds: Math.round(seconds * 10) / 10,
      challenge: current
    };
    results.push(outcome);
    step = "revealed";
    return outcome;
  }

  function timeout(seconds = 30) {
    if (step !== "playing") {
      return null;
    }
    const current = challenges[currentIndex];
    const outcome = {
      id: current.id,
      index: currentIndex,
      pickedLine: selectedLine,
      result: "timeout",
      seconds: Math.round(seconds * 10) / 10,
      challenge: current
    };
    results.push(outcome);
    step = "revealed";
    return outcome;
  }

  function nextSnippet() {
    if (step !== "revealed") {
      return null;
    }
    if (currentIndex < challenges.length - 1) {
      currentIndex += 1;
      selectedLine = null;
      step = "typing";
      return { done: false, index: currentIndex, challenge: challenges[currentIndex] };
    }
    step = "done";
    return {
      done: true,
      score: getScore(),
      total: challenges.length,
      results
    };
  }

  function getScore() {
    return results.filter((r) => r.result === "caught").length;
  }

  function getState() {
    return {
      packId,
      step,
      currentIndex,
      currentChallenge: challenges[currentIndex] ?? null,
      selectedLine,
      score: getScore(),
      total: challenges.length,
      results: [...results],
      isDone: step === "done"
    };
  }

  return {
    startRound,
    finishTyping,
    selectLine,
    lockAnswer,
    timeout,
    nextSnippet,
    getScore,
    getState
  };
}
