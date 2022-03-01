import React from 'react';
import ReactDOM, { render } from 'react-dom';
import './index.css';
import DoubleSlider from './lib/DoubleSlider';
const axios = require('axios');
const URL = "http://localhost:8000/";
const KEY = "A7FdteF8moJIY4XriqnR17qHx2XIbcWVCvRC5uVu";
var earliest = null

// ========================================

class Dashboard extends React.Component {
  // Constructor for this one-page site
  constructor(props) {
    super(props);
    // States
    this.state = {
      loaded: false,
      error: null,
      movies: [],
      staff: [],
      involvement: [],
      selectedmovie: null,
      selectedstaff: null,
      value: 0,
      nasa: []
    }
    // Refs
    this.displayResultsRef = React.createRef();
  }

  // Axios
  performMovieGet(KEY, queries) {
    // Use Axios to GET from the backend using the results
    axios.get(URL, { params: {mode: "moviedates", startyear: queries["start_date"], endyear: queries["end_date"]}})
      .then(
        (result) => {
          this.setState({
            loaded: true,
            movies: result.data.body.records,
            value: result.data.body.records.length
          });
          console.log(this.state.movies);
          this.displayResultsRef.current.innerHTML = this.state.value;
          this.state.selectedmovie = null;
          if (this.state.value > 0)
            this.state.selectedmovie = result.data.body.records[0]["properties"]["title"];
        },
        (error) => {
          this.setState({
            loaded: true,
            error: error
          });
        }
      );
  }

  performStaffGet(KEY, queries) {
    // Use Axios to GET from the backend using the results
    axios.get(URL, { params: {mode: "moviestaff", title: this.state.selectedmovie}})
      .then(
        (result) => {
          this.setState({
            loaded: true,
            staff: result.data.body.records,
            value: result.data.body.records.length
          });
          console.log(this.state.staff);
          this.displayResultsRef.current.innerHTML = this.state.value;
        },
        (error) => {
          this.setState({
            loaded: true,
            error: error
          });
        }
      );
  }

  performInvolvementGet(KEY, queries) {
    // Use Axios to GET from the backend using the results
    axios.get(URL, { params: {mode: "staffinvolvement", name: this.state.selectedstaff}})
      .then(
        (result) => {
          this.setState({
            loaded: true,
            involvement: result.data.body.records,
            value: result.data.body.records.length
          });
          console.log(this.state.staff);
          this.displayResultsRef.current.innerHTML = this.state.value;
        },
        (error) => {
          this.setState({
            loaded: true,
            error: error
          });
        }
      );
  }

  componentDidMount() {
    console.info("Dashboard mounted");
    let queries = this.props.queries;
    this.performMovieGet(KEY, queries);
  }

  /* Content rendering */
  /**Update the dropdown, which is performed for each render
   * @param {*} error 
   * @param {*} loaded 
   * @param {*} items 
   * @returns 
   */
  renderDropDown(error, loaded, items) {
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!loaded) {
      // IDEA: Loading screen
      return <div>Loading...</div>;
    } else {
      console.info(items);
      if (!items || items.length == 0) {
        return (<div>No movies found in this date range</div>);
      }
      console.log("Rendering..." + this.state.loaded);
      console.info(this.state.items);
      const dropdownlist = items.map((element, index) => {
        var properties = element["properties"];
        if (properties) {
          return (<option value={properties["title"]}>{properties["title"] + " (" + properties["released"]["low"] + ")"}</option>);
        }
        else {
          console.info("Properties are empty");
          return (<option value="_EMPTY">{"Empty"}</option>);
        }
      });
      return <div><select className="dropdown" value={this.state.selectedmovie} 
        onChange={(event) => {this.setState({selectedmovie: event.target.value}); this.state.selectedmovie=null}}>
          {dropdownlist}
        </select></div>;
    }
  }

  render() {
    const { error, loaded, movies, staff } = this.state;
    // IDEA: Adjust start, end, count
    console.error(this.state.selectedstaff);
    if (this.state.selectedstaff != null) {
      return (
        <div className="dashboard">
          <InvolvementForm root={this} />
    
          <div>
            Results: <span ref={this.displayResultsRef}>{this.state.value}</span>
          </div>
        </div>
      )
    } else {
      return (
        <div className="dashboard">
          <h1>Neo4J Movie Viewer</h1>

          <YearForm root={this} />
  
          <StaffForm root={this} />
          <div>
            Results: <span ref={this.displayResultsRef}>{this.state.value}</span>
          </div>
          <strong>Written by Mack</strong>
        </div>
      );
    }
  }
}

class YearForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: 0,  // Arbitrary
      end: 9999, // Arbitrary
      values: 0,
    }
    this.displayStartRef = React.createRef();
    this.displayEndRef = React.createRef();
    this.handleSubmitDates = this.handleSubmitDates.bind(this);
  }

  // Perform query after clicking submit
  handleSubmitDates(event) {
    let queries = { 
      "start_date": this.state.start, 
      "end_date": this.state.end, 
      "mode": "moviedates" 
    };

    console.log("Submitted movie date range.");
    this.props.root.performMovieGet(KEY, queries);
    // Clear Staff
    this.props.root.state.staff=null;
    event.preventDefault();
  }

  render() {
    return (
      <div id="YEAR_FORM">
        <h2>Select Date</h2>
        <DoubleSlider
          min={1975}
          max={new Date().getFullYear()+1}
          onChange={({ min, max }) => {this.state.start = min; this.state.end=max; 
            this.displayStartRef.current.innerHTML = this.state.start;
            this.displayEndRef.current.innerHTML = this.state.end;}}
        />
        <div>
          Date Range: <span ref={this.displayStartRef}>{this.state.start}</span> - <span ref={this.displayEndRef}>{this.state.end}</span><br />
        </div>
        <form onSubmit={this.handleSubmitDates}>
          <input className="submit" type="submit" value="Submit" onSubmit={this.handleSubmitDates}/>
        </form>
      </div>
    )
  }
}

/**Second component for selecting moving and filtering out staff after movie is determined.
 */
class StaffForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      actedin: true,
      directed: true,
      produced: true,
      wrote: true,
      watched: true,
      followed: true,
      reviewed: true,
      value: 0,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmitStaff = this.handleSubmitStaff.bind(this);
    this.renderStaffTable = this.renderStaffTable.bind(this);
    this.handleStaffClick = this.handleStaffClick.bind(this);
  }

  handleSubmitStaff(event) { 
    if (!this.props.root.state.selectedmovie) {
      console.info("No movie selected.");
    }
    const {actedin, directed, produced, wrote, watched, followed, reviewed} = this.state;
    let queries = { 
      "movie": this.props.root.state.selectedmovie, 
      "mode": "moviestaff" 
    };

    console.log("Submitted staff date range.");
    this.props.root.performStaffGet(KEY, queries);
    event.preventDefault();
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value });
  }

  handleStaffClick(event) {
    let queries = { 
      "name": this.props.root.state.selectedstaff, 
      "mode": "staffinvolvement" 
    };

    console.log("Submitted involvement for " + this.props.root.state.selectedstaff);
    this.props.root.performInvolvementGet(KEY, queries); 
    event.preventDefault();
  }

  /**After performing the second GET request listing all the staff for a given movie,
   * display the table whhich can be filtered.
   * @param {*} error 
   * @param {*} loaded 
   * @param {*} items 
   * @param {*} typetostate 
   * @returns 
   */
  renderStaffTable(error, loaded, items, typetostate) {
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!loaded) {
      // IDEA: Loading screen
      return <div>Loading...</div>;
    } else {
      // Clear table
      if (items == null)
        return <div>Click "See Staff" to see all staff</div>

      // Generate table
      console.info(items);
      if (!items || items.length == 0) {
        return (<div>Click "See Staff" to see all staff!</div>);
      }
      console.log("Rendering..." + this.state.loaded);
      // Note one staff may perform more than one relation to a movie
      // Output must alternate nodes then relationships
      var staffroles = {};
      for (var k in this.state.staff) {
        // Node
        if (!items[k]["start"]) {
          if (!staffroles[items[k]["identity"]["low"]])
          staffroles[items[k]["identity"]["low"]] = {"name": items[k]["properties"]["name"], "roles":[]}
        }
        // Relationship
        if (items[k]["start"]) {
          (staffroles[items[k]["start"]["low"]])["roles"].push(items[k]["type"]);
        }
      }
      console.info(staffroles);

      // Form a table. Duplicate entries are on separate rows.
      var staffpairs = []
      for (var k = 0; k < this.props.root.state.staff.length; k+=2) {
        var staffpair = {"staff": null, "role": null}
        staffpair["staff"] = items[k]["properties"]["name"];
        staffpair["role"] = items[k+1]["type"];
        staffpairs.push(staffpair)
      }
      console.info(staffpairs);

      var shown = 0;
      const table = staffpairs.map((element, index) => {
        if (typetostate[element["role"]]) {
          shown++;
          return <tr><td><a onClick={(event)=>{this.props.root.state.selectedstaff = element["staff"]; this.handleStaffClick(event)}}>
            {element["staff"]}</a></td>
            <td>{element["role"].replace("_", " ")}</td></tr>
        }
      });
      if (shown == 0)
        return <div>All staff are hidden.</div>
      return <>{table}</>;
    }
  }

  render() {
    const {error, loaded, movies, staff} = this.props.root.state;
    const {actedin, directed, produced, wrote, watched, followed, reviewed} = this.state;
    const typetostate = {"ACTED_IN": actedin, "DIRECTED": directed, "PRODUCED": produced, "WROTE": wrote, "WATCHED": watched, "FOLLOWED": followed, "REVIEWED": reviewed};
    return (
      <div id="STAFF_FORM">
      <h2>Select Movie</h2>
      {this.props.root.renderDropDown(error, loaded, movies)}
      <form onSubmit={this.handleSubmitStaff}>
      <div>
        <label className="checkbox"><input name="actedin" type="checkbox" checked={this.state.actedin} onChange={this.handleInputChange}/>ACTED IN</label>
        <label className="checkbox"><input name="directed" type="checkbox" checked={this.state.directed} onChange={this.handleInputChange}/>DIRECTED</label>
        <label className="checkbox"><input name="produced" type="checkbox" checked={this.state.produced} onChange={this.handleInputChange}/>PRODUCED</label>
        <label className="checkbox"><input name="wrote" type="checkbox" checked={this.state.wrote} onChange={this.handleInputChange}/>WROTE</label>
        <label className="checkbox"><input name="watched" type="checkbox" checked={this.state.watched} onChange={this.handleInputChange}/>WATCHED</label>
        <label className="checkbox"><input name="followed" type="checkbox" checked={this.state.followed} onChange={this.handleInputChange}/>FOLLOWED</label>
        <label className="checkbox"><input name="reviewed"  type="checkbox" checked={this.state.reviewed} onChange={this.handleInputChange}/>REVIEWED</label>
      </div>
      <input className="submit" type="submit" value="See Staff" onSubmit={this.handleSubmitStaff}/>
      </form>
      <br />

      <h2>Select Staff</h2>
      <table>
        <thead>
          <tr>
            <th className="twoinch">Name</th>
            <th className="twoinch">Role</th>
          </tr>
        </thead>
        <tbody>
          {this.renderStaffTable(error, loaded, staff, typetostate)}<br />
        </tbody>
      </table>
      <br />
      </div>
    )
  }
}

class InvolvementForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
    this.handleBack = this.handleBack.bind(this);
  }

  handleBack(event) {
    this.props.root.state.selectedstaff = null;
    this.setState({value: 1});
    this.props.root.setState({value: 0});
    event.preventDefault();
  }

  /**After performing the second GET request listing all the staff for a given movie,
   * display the table whhich can be filtered.
   * @param {*} error 
   * @param {*} loaded 
   * @param {*} items 
   * @param {*} typetostate 
   * @returns 
   */
  renderInvolvementTable(error, loaded, items) {
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!loaded) {
      // IDEA: Loading screen
      return <div>Loading...</div>;
    } else {
      // Clear table
      if (items == null)
        return <div>No roles known for {this.props.root.selectedstaff}.</div>

      // Generate table
      if (!items || items.length == 0) {
        return (<div>No roles known for {this.props.root.selectedstaff}!</div>);
      }
      console.log("Rendering..." + this.state.loaded);

      // Form a table. Entries for the same movie are on separate rows.
      var moviepairs = []
      console.info(this.props.root.state.involvement)
      for (var k = 0; k < this.props.root.state.involvement.length; k+=2) {
        var moviepair = {"title": null, "released": null, "role": null};
        moviepair["title"] = items[k]["properties"]["title"];
        moviepair["released"] = items[k]["properties"]["released"]["low"];
        moviepair["role"] = items[k+1]["type"];
        moviepairs.push(moviepair);
      }

      const table = moviepairs.map((element, index) => {
        return <tr><td>{element["title"] + " (" + element["released"] + ") "}</td><td>{element["role"]}</td></tr>
      });
      return <>{table}</>;
    }
  }

  render() {
    const {error, loaded, involvement} = this.props.root.state;
    return (
      <div id="INVOLVEMENT_FORM">
      <h2>Involvements for {this.props.root.state.selectedstaff}</h2>
      <table>
        <thead>
          <tr>
            <th className="twoinch">Title</th>
            <th className="twoinch">Role</th>
          </tr>
        </thead>
        <tbody>
          {this.renderInvolvementTable(error, loaded, involvement)}
        </tbody>
      </table>
      <div>
      <form onSubmit={this.handleBack}>
        <input className="submit" type="submit" value="↩ BACK" onSubmit={this.handleBack}/>
      </form>
      </div>
      </div>
    )
  }
}

// ========================================

ReactDOM.render(
  <Dashboard queries={{ "count": 3 }} />,
  document.getElementById('root'),
);
