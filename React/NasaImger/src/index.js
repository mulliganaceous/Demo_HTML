import React from 'react';
import ReactDOM, { render } from 'react-dom';
import './index.css';
const axios = require('axios');
const KEY = "A7FdteF8moJIY4XriqnR17qHx2XIbcWVCvRC5uVu";

// ========================================

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      items: [],
      start: null,
      end: null,
      count: 0
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Axios
  performGet(KEY, queries) {
    let paramstr = ""
    console.info(queries);
    this.setState({
      error: null,
      isLoaded: false,
      items: [],
      start: null,
      end: null,
      count: 0}
    );
    if (queries["start_date"] || queries["end_date"]) {
      if (queries["start_date"]) {
        paramstr += "&start_date="+queries["start_date"];
      }
      if (queries["end_date"]) {
        paramstr += "&end_date="+queries["end_date"];
      }
    }
    else {
      if (queries["count"]) {
        paramstr += "&count="+queries["count"];
      }
      else {
        paramstr += "&count=1"
      }
    }
      

    axios.get('https://api.nasa.gov/planetary/apod?api_key='+KEY+paramstr)
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result.data,
            count: result.data.length
          });
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error: error
          });
        }
      );
  }

  componentDidMount() {
    console.info("Dashboard mounted");
    let queries = this.props.queries;
    this.performGet(KEY, queries);
  }

  // Query parameters
  handleSubmit(event) {
    let queries = {"start_date":this.state.start, "end_date":this.state.end, "count":this.state.count};
    // Set state to not loaded
    this.performGet(KEY, queries)
    event.preventDefault();
  }

  // Content rendering
  renderImagePost(k, response) {
    return <ImagePost seq={k} info={response}/>
  }

  renderContent(error, isLoaded, items) {
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      // IDEA: Loading screen
      return <div>Loading...</div>;
    } else {
      console.info(items);
      console.log("Rendering..."+ this.state.isLoaded);
      console.info(this.state.items);
      const imglist = items.map((element, index) => {
        return (<div><ImagePost seq={index} items={items}/></div>);
      });
      return <div>{imglist}</div>;
    }
  }

  render() {
    const { error, isLoaded, items } = this.state;
    // IDEA: Adjust start, end, count
    return (
      <div className="imagepost">
        <form onSubmit={this.handleSubmit}>
          <label>
            Start Date (YYYY-MM-DD):
            <input 
              type="text" 
              name="start"
              onChange={((event) => this.setState({start: event.target.value})).bind(this)} /><br />
          </label>
          
          <label>
            End Date (YYYY-MM-DD):
            <input 
              type="text" 
              name="end"
              onChange={((event) => this.setState({end: event.target.value})).bind(this)} /><br />
          </label>

          <label>
            Count:
            <input 
              type="text" 
              name="count"
              onChange={((event) => {
                this.setState({count: event.target.value});
              }).bind(this)} /><br />
          </label>

          <input type="submit" value="Submit" />
        </form>

        {this.renderContent(error, isLoaded, items)}
      </div>
    );
  }
}

class ImagePost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seq: this.props.seq,
      item: this.props.items[this.props.seq],
      liked: 0
    };
    this.handleLike = this.handleLike.bind(this);
  }

  handleLike(event) {
    this.setState({liked: this.state.liked ^ 1});
    event.preventDefault();
  }

  render() {
    return(
      <div className="imagepost">
        {this.state.seq+1}: <span className="imagepostTitle">{this.state.item.title}</span>
        {this.state.liked ? " 👍" : ""}<br />
        {this.state.item.date}<br />
        <table>
          <tbody>
            <tr>
              <td>
              <img src={this.state.item.hdurl} width="400px"></img><br />
              <form onSubmit={this.handleLike}>
              <input type="submit" value={this.state.liked ? "Dislike" : "Like"} />
              </form>
              </td>
              <td>
              {this.state.item.explanation}
              </td>
            </tr>
          </tbody>
        </table>
        <br />
      </div>)
  }
}

// ========================================

ReactDOM.render(
  <Dashboard queries={{"count":3}} />,
  document.getElementById('root'),
);
