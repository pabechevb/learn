const AVPlayArrow = require('material-ui/svg-icons/av/play-arrow').default;
// const DoneIcon = require('material-ui/svg-icons/action/done').default;
// const EditIcon = require('material-ui/svg-icons/editor/mode-edit').default;
const FlatButton = require('material-ui/FlatButton').default;
// const FloatingActionButton = require('material-ui/FloatingActionButton').default;
const MenuItem = require('material-ui/MenuItem').default;
const moment = require('moment');
const React = require('react');
// const ResetIcon = require('material-ui/svg-icons/av/replay').default;
// const SaveIcon = require('material-ui/svg-icons/content/save').default;
const SelectField = require('material-ui/SelectField').default;
const TextField = require('material-ui/TextField').default;
const QuizLine = require('./quiz-line');
const helper = require('./helper');

const {
  alphabet,
  // getLowerUpper,
  operations,
} = helper;

// const numberStyle = {
//   fontSize: 'xx-large',
//   margin: '10px',
// };


function getScores() {
  let scores;
  try {
    scores = JSON.parse(localStorage.getItem('scores') || '[]');
  } catch (e) {
    scores = [];
  }
  return scores;
}

class MathDrill extends React.Component {
  constructor() {
    super();

    // TODO: opIndex, levelIndex to localStorage and restore at startup
    this.state = {
      currentTask: [],
      levelIndex: 0, // A
      lower: 1,
      opIndex: 0, // +
      upper: 3,
    };

    this.checkAnswer = this.checkAnswer.bind(this);
    this.focus = this.focus.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onStart = this.onStart.bind(this);
    this.reset = this.reset.bind(this);
    this.runningTotal = this.runningTotal.bind(this);
    this.save = this.save.bind(this);
    this.setNextTask = this.setNextTask.bind(this);
    this.onInterval = this.onInterval.bind(this);
  }

  componentWillMount() {
    // this.setNextTask();
  }

  componentDidMount() {
    this.focus();
  }

  onInterval() {
    const {
      endTime,
    } = this.state;
    const timeLeft = Math.round(endTime.diff(moment()) / 1000);
    const timeIsUp = timeLeft <= 0;
    if (timeIsUp) {
      clearInterval(this.state.timerId);
    }
    this.setState({
      timeLeft,
      timeIsUp,
    });
  }

  onStart() {
    this.setNextTask();
    const { minutes = '1' } = this.state;
    const seconds = parseFloat(minutes, 10) * 60;
    const endTime = moment().add(seconds, 'seconds');
    const timerId = setInterval(this.onInterval, 1000);
    this.setState({
      currentAction: 'running',
      endTime,
      timerId,
      seconds,
      timeLeft: seconds,
    });
  }

  onChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  }

  getRandom() {
    const min = Math.ceil(this.state.lower);
    const max = Math.floor(this.state.upper);
    return Math.floor(Math.random() * ((max - min) + 1)) + min;
  }

  setNextTask() {
    const { levelIndex, opIndex, currentTask } = this.state;
    const nextTask = helper.getLowerUpper(levelIndex, opIndex);

    if (nextTask.every((item, index) => currentTask[index] === item)) {
      // 
      this.setNextTask();
    } else {
      this.setState({
        currentTask: nextTask,
      });
    }
  }

  getExpected(left, right) {
    switch (this.state.opIndex) {
      case 0:
        return left + right;
      case 1:
        return left - right;
      case 2:
        return left * right;
      case 3:
        return left / right;
      default:
        return 0;
    }
  }

  isSameProblem(left, right) {
    if (this.state.upper - this.state.lower < 3) {
      return false;
    }
    const newNumbers = [left, right].sort();
    const oldNumbers = [this.state.left, this.state.right].sort();
    return newNumbers[0] === oldNumbers[0] && newNumbers[1] === oldNumbers[1];
  }

  save() {
    const {
      startTime,
      correctCount,
      totalCount,
    } = this.state;
    if (totalCount) {
      const scores = getScores();
      const {
        lower,
        sign,
        upper,
      } = this.state;
      scores.unshift({
        correctCount,
        date: new Date().toISOString(),
        lower,
        sign,
        time: Math.round((Date.now() - startTime) / 1000),
        totalCount,
        upper,
      });
      if (scores.length > 10) {
        scores.pop();
      }
      localStorage.setItem('scores', JSON.stringify(scores));
      this.setState({ scores });
      this.reset();
    }
  }

  focus() {
    if (this.answerInput) {
      this.answerInput.focus();
    }
  }

  runningTotal() {
    const { correctCount, totalCount, startTime } = this.state;
    const seconds = Math.round((Date.now() - startTime) / 1000);
    return `${correctCount} / ${totalCount}  (${seconds}s)`;
  }

  reset() {
    this.setState({
      startTime: Date.now(),
      correctCount: 0,
      totalCount: 0,
    });
    this.focus();
  }

  handleKeyPress(event) {
    if (event.key === 'Enter') {
      this.checkAnswer();
    }
  }

  checkAnswer() {
    const actual = parseInt(this.state.answer, 10);
    if (!isNaN(actual)) {
      let { correctCount, totalCount } = this.state;
      totalCount += 1;
      const expected = this.getExpected();
      const correct = actual === expected;
      if (correct) {
        correctCount += 1;
      }
      const answer = '';
      this.setState({
        answer,
        correct,
        correctCount,
        result: `${actual} is ${correct ? 'correct' : 'wrong'}`,
        totalCount,
      });
      if (correct) {
        this.setNextTask();
      }
    }

    this.focus();
  }

  renderOptions() {
    // eslint-disable-next-line no-console
    console.log('state:', this.state);
    const {
      level = 0,
      opIndex,
      errors = {},
      minutes = 1,
      currentAction,
    } = this.state || {};
    const divStyle = currentAction === 'running'
      ? {
        pointerEvents: 'none',
        opacity: 0.4,
      } : {};
    // eslint-disable-next-line no-console
    console.log('level:', level);
    return (<div style={divStyle}>
      <SelectField
        floatingLabelText="Level"
        value={level}
        onChange={(e, i, v) => this.setState({ level: v })}
        name="level"
        style={{ width: 100 }}
      >
        {
          alphabet.map((letter, index) =>
            <MenuItem key={letter} value={index} primaryText={letter} />)
        }
      </SelectField>
      <SelectField
        floatingLabelText="Operation"
        value={opIndex}
        onChange={(e, i, v) => this.setState({ opIndex: v })}
        name="operation"
        style={{ width: 100 }}
      >
        {
          operations.map((operation, index) =>
            <MenuItem key={operation} value={index} primaryText={operation} />)
        }
      </SelectField>
      <TextField
        errorText={errors.minutes}
        floatingLabelText="Time"
        hintText="Minutes"
        name="minutes"
        onChange={this.onChange}
        type="number"
        value={minutes}
        style={{ width: 100, paddingLeft: 20 }}
      />
      <FlatButton
        label="Start"
        labelPosition="before"
        primary
        onClick={this.onStart}
        icon={<AVPlayArrow />}
      />
    </div>);
  }

  renderRunning() {
    const {
      answer = '',
      currentTask,
      level = 0,
      opIndex,
      timeLeft,
    } = this.state || {};

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
          <span style={spanStyle}>{`Level: ${alphabet[level]}`}</span>
          <span style={spanStyle}>{`Operation: ${operations[opIndex]}`}</span>
          <span style={spanStyle}>{`Time Left: ${timeLeft} seconds`}</span>
        </div>
        <div>
          <QuizLine
            answer={answer}
            checkAnswer={this.checkAnswer}
            handleKeyPress={this.handleKeyPress}
            onChange={this.onChange}
            problem={currentTask}
          />
        </div>
      </div>);
  }

  render() {
    const {
      currentAction = 'start',
    } = this.state || {};
    switch (currentAction) {
      case 'start':
        return this.renderOptions();
      case 'running':
        return this.renderRunning();
      default:
        throw new Error(`Unknown currentAction ${currentAction}`);
    }
  }
}

module.exports = MathDrill;
