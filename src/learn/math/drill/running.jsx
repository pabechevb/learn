const helper = require('./helper');
const PropTypes = require('prop-types');
const QuizLine = require('./quiz-line');
const React = require('react');
const RunningResults = require('./running-results');

const {
  alphabet,
  operations,
} = helper;

function running(props) {
  const {
    currentTask,
    levelIndex,
    opIndex,
    timeLeft,
    result = '',
    runningLine,
  } = props;

  if (!currentTask) {
    // eslint-disable-next-line no-console
    console.warn('No currentTask defined in renderRunning');
    return null;
  }

  const spanStyle = {
    paddingLeft: 20,
  };
  return (
    <div>
      <div>
        <span style={spanStyle}>{`Level: ${alphabet[levelIndex]}`}</span>
        <span style={spanStyle}>{`Operation: ${operations[opIndex]}`}</span>
        <span style={spanStyle}>{`Time Left: ${timeLeft} seconds`}</span>
      </div>
      <div>
        <QuizLine
          checkAnswer={props.checkAnswer}
          problem={currentTask}
        />
        <RunningResults
          result={result}
          running={runningLine}
        />
      </div>
    </div>);
}

running.propTypes = {
  checkAnswer: PropTypes.func.isRequired,
  currentTask: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  levelIndex: PropTypes.number.isRequired,
  opIndex: PropTypes.number.isRequired,
  result: PropTypes.string.isRequired,
  runningLine: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  timeLeft: PropTypes.number.isRequired,
};

module.exports = running;
