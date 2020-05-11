import React, {Component, Fragment } from 'react'
import CanvasJSReact from '../assets/canvasjs.react';
import '@popperjs/core'
import * as moment from 'moment'
import { currentCourse } from '../redux'
import { connect } from 'react-redux'
import LoaderHOC_ from '../HOCs/LoaderHOC'
// var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;
const back = '<'
let avgs=[]
let maxColor; let minColor

class WeekAvgs extends Component {	
	state = {
		avgs: [],
		beginning: moment().clone().subtract(7, 'days').toDate(),
		ending: moment().clone().toDate(),
		current_course: this.props.current_course,
	}
              
	
	weekBack = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.beginning).subtract(7, 'days').toDate(),
				ending: moment(prev.beginning)
			})
	    })
	}
	
	weekForward = () => {
		this.setState(prev => {
			return ({
				beginning: moment(prev.ending),
				ending: moment(prev.ending).add(7, 'days').toDate()
			})
	    })
	}


	fillData = () => {
		let myData = this.props.current_course.responses.filter(response => response.datatype == 'light')
		.filter(response => (moment(parseInt(response.day)) >= moment(this.state.beginning)) && (moment(parseInt(response.day)) <= moment(this.state.ending)))

	//seven times, filter by date and take average
		let arr = []
		for (let i=0; i<8; i++){
			let week_day = moment(this.state.beginning).clone().add(i, 'days')
			let point = {};
			point.label = `${week_day.format("MMM D")}`
			point.x = week_day.toDate()
			point.date = week_day.format("dddd")
			point.y = parseFloat(this.computeAverage(myData.filter(response => moment(parseInt(response.day)).format("MMM D") == week_day.format("MMM D"))))
			point.responses = (myData.filter(response => moment(parseInt(response.day)).format("MMM D") == week_day.format("MMM D"))).length
			point.reds = this.findReds(myData.filter(response => moment(parseInt(response.day)).format("MMM D") == week_day.format("MMM D")))
			avgs.push(point.y)
			arr.push(point)
			}
		return arr
	}

	findReds = (arr) => {
        let allReds = []
		let reds = arr.filter(entry => entry.answer == 'red').map(entry => entry.student_id)
            reds.forEach(id => {
				let toAdd = this.props.current_course.students
				.find(student => student.id == id)
                if (!allReds.includes(toAdd.name)){
                    allReds.push(toAdd.name)
                }
            })
        if (allReds.length == 0){
            return <i>None recorded</i>
        } else {
            return allReds.join(', ')
        }
    }

    computeAverage = (daysResponses) => {
      if (daysResponses.length !==0 ){
      let numerical = daysResponses.map(entry => {
        return entry.answer == 'red' ?  2 : (entry.answer == 'yellow' ? 6 : 10)
      })
	  let avg = (numerical.reduce((a,b)=>a+b)/daysResponses.length).toFixed(1)
	  return avg
	  } else { return 0}
	}

	
	calculateHigh = () => {
		let high = Math.max(...avgs)
		if (high <= 4){
			maxColor = 'red'
		} else if (high > 4 && high < 7.5){
			maxColor = 'yellow'
		} else{
			maxColor = 'green'
		} 
		return high
	}

	calculateLow = () => {
		let low = Math.min(...avgs)
		if (low <= 4){
			minColor = 'red'
		} else if (low > 4 && low < 7.5){
			minColor = 'yellow'
		} else{
			minColor = 'green'
		} 
		return low
	}

	listFeedback = () => {
		return this.props.current_course.responses
		.filter(response => moment(parseInt(response.day)) >= moment(this.state.beginning))
		.filter(response => moment(parseInt(response.day)) <= moment(this.state.ending))
		.map(resp => {
				if (!!resp.feedback){
					return <>&emsp;<li key={resp.id}>{resp.feedback}</li></>
				} else {
					return null
				}
			})
		}
    	
	render() {
        const options = {
			backgroundColor: "transparent",
			animationEnabled: true,
			exportEnabled: true,
			theme: "light2", 
			title:{
				text: "Daily Averages",
			fontSize: 26
			},
			subtitles: [
				{text: `Week of ${moment(this.state.beginning).format("MMM D")} - ${moment(this.state.ending).format("MMM D")}`,
				fontSize: 22}
			],
			axisX: {
				title: `Date`,
				intervalType: 'day',
				interval: 1,
				valueFormatString: "MMM D",
				minimum: this.state.beginning,
				maximum: this.state.ending,

			},
			axisY: {
				title: "Traffic Temperature",
				minimum: 0,
        		maximum: 12
			},
			data: [{
				type: "spline",
				lineColor: 'black',
				xValueType: 'dateTime',
				markerType: "circle",
				type: "line",
				connectNullData: true,
				toolTipContent: "<b>{label}</b><br>Date: {date}<br>Number of Responses: {responses}<br>Day's Average: {y}<br>Reds: {reds}",
				dataPoints: this.fillData()
			}]
		}
		return (
			<Fragment>
		  <div className="row flex-row-2">
			  <div className ="col-md-8">
				<div className="week-avgs">
					<CanvasJSChart id="chartContainer" options = {options}	/>
					<button className="btn btn-outline-primary weekBack" onClick={this.weekBack}><h2>{back}</h2></button>
					<button className="btn btn-outline-primary weekForward" onClick={this.weekForward}><h2>></h2></button>
			    </div>
				<br></br><br></br>
				<div className='flex-row'>
					<div className='col-md-1'></div>
					<div className={`col-md-2 btn ${maxColor}`}>
						<span className='aa' style={{'color': '#343a40'}}>Week's High:  {this.calculateHigh()}</span>
					</div>
					<br></br><br></br>
					<div className='col-md-2'></div>
					<div className={`col-md-2 btn ${minColor}`}>
						<span className='aa' style={{'color': '#343a40'}}>Week's Low:  {this.calculateLow()}</span>
					</div>
					<div className='col-md-1'></div>
			  </div>
				</div>
			<div className='col-md-3'>
				<div style={{'display': 'flex', 'flexDirection': 'column'}}>
					<div className='feedback'>
						<h5>Recent Feedback:</h5>
						<ul>{this.listFeedback()}</ul>
						<a style={{'maxWidth': '180px', 'alignSelf': 'center', 'fontSize': '18px', 'color': 'white'}} className='btn btn-warning' onClick={() => this.setCourse(this.props.current_course)} href="/courses/current">Go Back</a>
					</div>
				</div>

				<br></br><br></br><br></br>
			</div>  
			</div>
		<br></br><br></br>
		</Fragment>
		);
	}
}
	
const mapStateToProps = state => {
    return {
        current_user: state.auths.current_user,
        current_course: state.courses.current_course,
		user_courses: state.courses.user_courses,
		teachers_responses: state.responses.teachers_responses
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentCourse: course => dispatch(currentCourse(course))
    }
}

export default LoaderHOC_(connect(mapStateToProps, mapDispatchToProps)(WeekAvgs))

/*
YARN LOCK
# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1


"@babel/code-frame@7.8.3", "@babel/code-frame@^7.0.0", "@babel/code-frame@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/code-frame/-/code-frame-7.8.3.tgz#33e25903d7481181534e12ec0a25f16b6fcf419e"
  integrity sha512-a9gxpmdXtZEInkCSHUJDLHZVBgb1QS0jhss4cPP93EW7s+uC5bikET2twEF3KV+7rDblJcmNvTR7VJejqd2C2g==
  dependencies:
    "@babel/highlight" "^7.8.3"

"@babel/compat-data@^7.8.6", "@babel/compat-data@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/compat-data/-/compat-data-7.9.0.tgz#04815556fc90b0c174abd2c0c1bb966faa036a6c"
  integrity sha512-zeFQrr+284Ekvd9e7KAX954LkapWiOmQtsfHirhxqfdlX6MEC32iRE+pqUGlYIBchdevaCwvzxWGSy/YBNI85g==
  dependencies:
    browserslist "^4.9.1"
    invariant "^2.2.4"
    semver "^5.5.0"

"@babel/core@7.9.0", "@babel/core@^7.1.0", "@babel/core@^7.4.5":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/core/-/core-7.9.0.tgz#ac977b538b77e132ff706f3b8a4dbad09c03c56e"
  integrity sha512-kWc7L0fw1xwvI0zi8OKVBuxRVefwGOrKSQMvrQ3dW+bIIavBY3/NpXmpjMy7bQnLgwgzWQZ8TlM57YHpHNHz4w==
  dependencies:
    "@babel/code-frame" "^7.8.3"
    "@babel/generator" "^7.9.0"
    "@babel/helper-module-transforms" "^7.9.0"
    "@babel/helpers" "^7.9.0"
    "@babel/parser" "^7.9.0"
    "@babel/template" "^7.8.6"
    "@babel/traverse" "^7.9.0"
    "@babel/types" "^7.9.0"
    convert-source-map "^1.7.0"
    debug "^4.1.0"
    gensync "^1.0.0-beta.1"
    json5 "^2.1.2"
    lodash "^4.17.13"
    resolve "^1.3.2"
    semver "^5.4.1"
    source-map "^0.5.0"

"@babel/generator@^7.4.0", "@babel/generator@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/generator/-/generator-7.9.0.tgz#0f67adea4ec39dad6e63345f70eec33014d78c89"
  integrity sha512-onl4Oy46oGCzymOXtKMQpI7VXtCbTSHK1kqBydZ6AmzuNcacEVqGk9tZtAS+48IA9IstZcDCgIg8hQKnb7suRw==
  dependencies:
    "@babel/types" "^7.9.0"
    jsesc "^2.5.1"
    lodash "^4.17.13"
    source-map "^0.5.0"

"@babel/helper-annotate-as-pure@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-annotate-as-pure/-/helper-annotate-as-pure-7.8.3.tgz#60bc0bc657f63a0924ff9a4b4a0b24a13cf4deee"
  integrity sha512-6o+mJrZBxOoEX77Ezv9zwW7WV8DdluouRKNY/IR5u/YTMuKHgugHOzYWlYvYLpLA9nPsQCAAASpCIbjI9Mv+Uw==
  dependencies:
    "@babel/types" "^7.8.3"

"@babel/helper-builder-binary-assignment-operator-visitor@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-builder-binary-assignment-operator-visitor/-/helper-builder-binary-assignment-operator-visitor-7.8.3.tgz#c84097a427a061ac56a1c30ebf54b7b22d241503"
  integrity sha512-5eFOm2SyFPK4Rh3XMMRDjN7lBH0orh3ss0g3rTYZnBQ+r6YPj7lgDyCvPphynHvUrobJmeMignBr6Acw9mAPlw==
  dependencies:
    "@babel/helper-explode-assignable-expression" "^7.8.3"
    "@babel/types" "^7.8.3"

"@babel/helper-builder-react-jsx-experimental@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/helper-builder-react-jsx-experimental/-/helper-builder-react-jsx-experimental-7.9.0.tgz#066d80262ade488f9c1b1823ce5db88a4cedaa43"
  integrity sha512-3xJEiyuYU4Q/Ar9BsHisgdxZsRlsShMe90URZ0e6przL26CCs8NJbDoxH94kKT17PcxlMhsCAwZd90evCo26VQ==
  dependencies:
    "@babel/helper-annotate-as-pure" "^7.8.3"
    "@babel/helper-module-imports" "^7.8.3"
    "@babel/types" "^7.9.0"

"@babel/helper-builder-react-jsx@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/helper-builder-react-jsx/-/helper-builder-react-jsx-7.9.0.tgz#16bf391990b57732700a3278d4d9a81231ea8d32"
  integrity sha512-weiIo4gaoGgnhff54GQ3P5wsUQmnSwpkvU0r6ZHq6TzoSzKy4JxHEgnxNytaKbov2a9z/CVNyzliuCOUPEX3Jw==
  dependencies:
    "@babel/helper-annotate-as-pure" "^7.8.3"
    "@babel/types" "^7.9.0"

"@babel/helper-call-delegate@^7.8.7":
  version "7.8.7"
  resolved "https://registry.yarnpkg.com/@babel/helper-call-delegate/-/helper-call-delegate-7.8.7.tgz#28a279c2e6c622a6233da548127f980751324cab"
  integrity sha512-doAA5LAKhsFCR0LAFIf+r2RSMmC+m8f/oQ+URnUET/rWeEzC0yTRmAGyWkD4sSu3xwbS7MYQ2u+xlt1V5R56KQ==
  dependencies:
    "@babel/helper-hoist-variables" "^7.8.3"
    "@babel/traverse" "^7.8.3"
    "@babel/types" "^7.8.7"

"@babel/helper-compilation-targets@^7.8.7":
  version "7.8.7"
  resolved "https://registry.yarnpkg.com/@babel/helper-compilation-targets/-/helper-compilation-targets-7.8.7.tgz#dac1eea159c0e4bd46e309b5a1b04a66b53c1dde"
  integrity sha512-4mWm8DCK2LugIS+p1yArqvG1Pf162upsIsjE7cNBjez+NjliQpVhj20obE520nao0o14DaTnFJv+Fw5a0JpoUw==
  dependencies:
    "@babel/compat-data" "^7.8.6"
    browserslist "^4.9.1"
    invariant "^2.2.4"
    levenary "^1.1.1"
    semver "^5.5.0"

"@babel/helper-create-class-features-plugin@^7.8.3":
  version "7.8.6"
  resolved "https://registry.yarnpkg.com/@babel/helper-create-class-features-plugin/-/helper-create-class-features-plugin-7.8.6.tgz#243a5b46e2f8f0f674dc1387631eb6b28b851de0"
  integrity sha512-klTBDdsr+VFFqaDHm5rR69OpEQtO2Qv8ECxHS1mNhJJvaHArR6a1xTf5K/eZW7eZpJbhCx3NW1Yt/sKsLXLblg==
  dependencies:
    "@babel/helper-function-name" "^7.8.3"
    "@babel/helper-member-expression-to-functions" "^7.8.3"
    "@babel/helper-optimise-call-expression" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/helper-replace-supers" "^7.8.6"
    "@babel/helper-split-export-declaration" "^7.8.3"

"@babel/helper-create-regexp-features-plugin@^7.8.3", "@babel/helper-create-regexp-features-plugin@^7.8.8":
  version "7.8.8"
  resolved "https://registry.yarnpkg.com/@babel/helper-create-regexp-features-plugin/-/helper-create-regexp-features-plugin-7.8.8.tgz#5d84180b588f560b7864efaeea89243e58312087"
  integrity sha512-LYVPdwkrQEiX9+1R29Ld/wTrmQu1SSKYnuOk3g0CkcZMA1p0gsNxJFj/3gBdaJ7Cg0Fnek5z0DsMULePP7Lrqg==
  dependencies:
    "@babel/helper-annotate-as-pure" "^7.8.3"
    "@babel/helper-regex" "^7.8.3"
    regexpu-core "^4.7.0"

"@babel/helper-define-map@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-define-map/-/helper-define-map-7.8.3.tgz#a0655cad5451c3760b726eba875f1cd8faa02c15"
  integrity sha512-PoeBYtxoZGtct3md6xZOCWPcKuMuk3IHhgxsRRNtnNShebf4C8YonTSblsK4tvDbm+eJAw2HAPOfCr+Q/YRG/g==
  dependencies:
    "@babel/helper-function-name" "^7.8.3"
    "@babel/types" "^7.8.3"
    lodash "^4.17.13"

"@babel/helper-explode-assignable-expression@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-explode-assignable-expression/-/helper-explode-assignable-expression-7.8.3.tgz#a728dc5b4e89e30fc2dfc7d04fa28a930653f982"
  integrity sha512-N+8eW86/Kj147bO9G2uclsg5pwfs/fqqY5rwgIL7eTBklgXjcOJ3btzS5iM6AitJcftnY7pm2lGsrJVYLGjzIw==
  dependencies:
    "@babel/traverse" "^7.8.3"
    "@babel/types" "^7.8.3"

"@babel/helper-function-name@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-function-name/-/helper-function-name-7.8.3.tgz#eeeb665a01b1f11068e9fb86ad56a1cb1a824cca"
  integrity sha512-BCxgX1BC2hD/oBlIFUgOCQDOPV8nSINxCwM3o93xP4P9Fq6aV5sgv2cOOITDMtCfQ+3PvHp3l689XZvAM9QyOA==
  dependencies:
    "@babel/helper-get-function-arity" "^7.8.3"
    "@babel/template" "^7.8.3"
    "@babel/types" "^7.8.3"

"@babel/helper-get-function-arity@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-get-function-arity/-/helper-get-function-arity-7.8.3.tgz#b894b947bd004381ce63ea1db9f08547e920abd5"
  integrity sha512-FVDR+Gd9iLjUMY1fzE2SR0IuaJToR4RkCDARVfsBBPSP53GEqSFjD8gNyxg246VUyc/ALRxFaAK8rVG7UT7xRA==
  dependencies:
    "@babel/types" "^7.8.3"

"@babel/helper-hoist-variables@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-hoist-variables/-/helper-hoist-variables-7.8.3.tgz#1dbe9b6b55d78c9b4183fc8cdc6e30ceb83b7134"
  integrity sha512-ky1JLOjcDUtSc+xkt0xhYff7Z6ILTAHKmZLHPxAhOP0Nd77O+3nCsd6uSVYur6nJnCI029CrNbYlc0LoPfAPQg==
  dependencies:
    "@babel/types" "^7.8.3"

"@babel/helper-member-expression-to-functions@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-member-expression-to-functions/-/helper-member-expression-to-functions-7.8.3.tgz#659b710498ea6c1d9907e0c73f206eee7dadc24c"
  integrity sha512-fO4Egq88utkQFjbPrSHGmGLFqmrshs11d46WI+WZDESt7Wu7wN2G2Iu+NMMZJFDOVRHAMIkB5SNh30NtwCA7RA==
  dependencies:
    "@babel/types" "^7.8.3"

"@babel/helper-module-imports@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-module-imports/-/helper-module-imports-7.8.3.tgz#7fe39589b39c016331b6b8c3f441e8f0b1419498"
  integrity sha512-R0Bx3jippsbAEtzkpZ/6FIiuzOURPcMjHp+Z6xPe6DtApDJx+w7UYyOLanZqO8+wKR9G10s/FmHXvxaMd9s6Kg==
  dependencies:
    "@babel/types" "^7.8.3"

"@babel/helper-module-transforms@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/helper-module-transforms/-/helper-module-transforms-7.9.0.tgz#43b34dfe15961918707d247327431388e9fe96e5"
  integrity sha512-0FvKyu0gpPfIQ8EkxlrAydOWROdHpBmiCiRwLkUiBGhCUPRRbVD2/tm3sFr/c/GWFrQ/ffutGUAnx7V0FzT2wA==
  dependencies:
    "@babel/helper-module-imports" "^7.8.3"
    "@babel/helper-replace-supers" "^7.8.6"
    "@babel/helper-simple-access" "^7.8.3"
    "@babel/helper-split-export-declaration" "^7.8.3"
    "@babel/template" "^7.8.6"
    "@babel/types" "^7.9.0"
    lodash "^4.17.13"

"@babel/helper-optimise-call-expression@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-optimise-call-expression/-/helper-optimise-call-expression-7.8.3.tgz#7ed071813d09c75298ef4f208956006b6111ecb9"
  integrity sha512-Kag20n86cbO2AvHca6EJsvqAd82gc6VMGule4HwebwMlwkpXuVqrNRj6CkCV2sKxgi9MyAUnZVnZ6lJ1/vKhHQ==
  dependencies:
    "@babel/types" "^7.8.3"

"@babel/helper-plugin-utils@^7.0.0", "@babel/helper-plugin-utils@^7.8.0", "@babel/helper-plugin-utils@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-plugin-utils/-/helper-plugin-utils-7.8.3.tgz#9ea293be19babc0f52ff8ca88b34c3611b208670"
  integrity sha512-j+fq49Xds2smCUNYmEHF9kGNkhbet6yVIBp4e6oeQpH1RUs/Ir06xUKzDjDkGcaaokPiTNs2JBWHjaE4csUkZQ==

"@babel/helper-regex@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-regex/-/helper-regex-7.8.3.tgz#139772607d51b93f23effe72105b319d2a4c6965"
  integrity sha512-BWt0QtYv/cg/NecOAZMdcn/waj/5P26DR4mVLXfFtDokSR6fyuG0Pj+e2FqtSME+MqED1khnSMulkmGl8qWiUQ==
  dependencies:
    lodash "^4.17.13"

"@babel/helper-remap-async-to-generator@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-remap-async-to-generator/-/helper-remap-async-to-generator-7.8.3.tgz#273c600d8b9bf5006142c1e35887d555c12edd86"
  integrity sha512-kgwDmw4fCg7AVgS4DukQR/roGp+jP+XluJE5hsRZwxCYGg+Rv9wSGErDWhlI90FODdYfd4xG4AQRiMDjjN0GzA==
  dependencies:
    "@babel/helper-annotate-as-pure" "^7.8.3"
    "@babel/helper-wrap-function" "^7.8.3"
    "@babel/template" "^7.8.3"
    "@babel/traverse" "^7.8.3"
    "@babel/types" "^7.8.3"

"@babel/helper-replace-supers@^7.8.3", "@babel/helper-replace-supers@^7.8.6":
  version "7.8.6"
  resolved "https://registry.yarnpkg.com/@babel/helper-replace-supers/-/helper-replace-supers-7.8.6.tgz#5ada744fd5ad73203bf1d67459a27dcba67effc8"
  integrity sha512-PeMArdA4Sv/Wf4zXwBKPqVj7n9UF/xg6slNRtZW84FM7JpE1CbG8B612FyM4cxrf4fMAMGO0kR7voy1ForHHFA==
  dependencies:
    "@babel/helper-member-expression-to-functions" "^7.8.3"
    "@babel/helper-optimise-call-expression" "^7.8.3"
    "@babel/traverse" "^7.8.6"
    "@babel/types" "^7.8.6"

"@babel/helper-simple-access@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-simple-access/-/helper-simple-access-7.8.3.tgz#7f8109928b4dab4654076986af575231deb639ae"
  integrity sha512-VNGUDjx5cCWg4vvCTR8qQ7YJYZ+HBjxOgXEl7ounz+4Sn7+LMD3CFrCTEU6/qXKbA2nKg21CwhhBzO0RpRbdCw==
  dependencies:
    "@babel/template" "^7.8.3"
    "@babel/types" "^7.8.3"

"@babel/helper-split-export-declaration@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-split-export-declaration/-/helper-split-export-declaration-7.8.3.tgz#31a9f30070f91368a7182cf05f831781065fc7a9"
  integrity sha512-3x3yOeyBhW851hroze7ElzdkeRXQYQbFIb7gLK1WQYsw2GWDay5gAJNw1sWJ0VFP6z5J1whqeXH/WCdCjZv6dA==
  dependencies:
    "@babel/types" "^7.8.3"

"@babel/helper-validator-identifier@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/helper-validator-identifier/-/helper-validator-identifier-7.9.0.tgz#ad53562a7fc29b3b9a91bbf7d10397fd146346ed"
  integrity sha512-6G8bQKjOh+of4PV/ThDm/rRqlU7+IGoJuofpagU5GlEl29Vv0RGqqt86ZGRV8ZuSOY3o+8yXl5y782SMcG7SHw==

"@babel/helper-wrap-function@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/helper-wrap-function/-/helper-wrap-function-7.8.3.tgz#9dbdb2bb55ef14aaa01fe8c99b629bd5352d8610"
  integrity sha512-LACJrbUET9cQDzb6kG7EeD7+7doC3JNvUgTEQOx2qaO1fKlzE/Bf05qs9w1oXQMmXlPO65lC3Tq9S6gZpTErEQ==
  dependencies:
    "@babel/helper-function-name" "^7.8.3"
    "@babel/template" "^7.8.3"
    "@babel/traverse" "^7.8.3"
    "@babel/types" "^7.8.3"

"@babel/helpers@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/helpers/-/helpers-7.9.0.tgz#ab2c1bc4821af766cab51d4868a5038874ea5a12"
  integrity sha512-/9GvfYTCG1NWCNwDj9e+XlnSCmWW/r9T794Xi58vPF9WCcnZCAZ0kWLSn54oqP40SUvh1T2G6VwKmFO5AOlW3A==
  dependencies:
    "@babel/template" "^7.8.3"
    "@babel/traverse" "^7.9.0"
    "@babel/types" "^7.9.0"

"@babel/highlight@^7.8.3":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/highlight/-/highlight-7.9.0.tgz#4e9b45ccb82b79607271b2979ad82c7b68163079"
  integrity sha512-lJZPilxX7Op3Nv/2cvFdnlepPXDxi29wxteT57Q965oc5R9v86ztx0jfxVrTcBk8C2kcPkkDa2Z4T3ZsPPVWsQ==
  dependencies:
    "@babel/helper-validator-identifier" "^7.9.0"
    chalk "^2.0.0"
    js-tokens "^4.0.0"

"@babel/parser@^7.1.0", "@babel/parser@^7.4.3", "@babel/parser@^7.7.0", "@babel/parser@^7.8.6", "@babel/parser@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/parser/-/parser-7.9.0.tgz#f821b32313f07ee570976d3f6238e8d2d66e0a8e"
  integrity sha512-Iwyp00CZsypoNJcpXCbq3G4tcDgphtlMwMVrMhhZ//XBkqjXF7LW6V511yk0+pBX3ZwwGnPea+pTKNJiqA7pUg==

"@babel/plugin-proposal-async-generator-functions@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-async-generator-functions/-/plugin-proposal-async-generator-functions-7.8.3.tgz#bad329c670b382589721b27540c7d288601c6e6f"
  integrity sha512-NZ9zLv848JsV3hs8ryEh7Uaz/0KsmPLqv0+PdkDJL1cJy0K4kOCFa8zc1E3mp+RHPQcpdfb/6GovEsW4VDrOMw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/helper-remap-async-to-generator" "^7.8.3"
    "@babel/plugin-syntax-async-generators" "^7.8.0"

"@babel/plugin-proposal-class-properties@7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-class-properties/-/plugin-proposal-class-properties-7.8.3.tgz#5e06654af5cd04b608915aada9b2a6788004464e"
  integrity sha512-EqFhbo7IosdgPgZggHaNObkmO1kNUe3slaKu54d5OWvy+p9QIKOzK1GAEpAIsZtWVtPXUHSMcT4smvDrCfY4AA==
  dependencies:
    "@babel/helper-create-class-features-plugin" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-proposal-decorators@7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-decorators/-/plugin-proposal-decorators-7.8.3.tgz#2156860ab65c5abf068c3f67042184041066543e"
  integrity sha512-e3RvdvS4qPJVTe288DlXjwKflpfy1hr0j5dz5WpIYYeP7vQZg2WfAEIp8k5/Lwis/m5REXEteIz6rrcDtXXG7w==
  dependencies:
    "@babel/helper-create-class-features-plugin" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-decorators" "^7.8.3"

"@babel/plugin-proposal-dynamic-import@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-dynamic-import/-/plugin-proposal-dynamic-import-7.8.3.tgz#38c4fe555744826e97e2ae930b0fb4cc07e66054"
  integrity sha512-NyaBbyLFXFLT9FP+zk0kYlUlA8XtCUbehs67F0nnEg7KICgMc2mNkIeu9TYhKzyXMkrapZFwAhXLdnt4IYHy1w==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-dynamic-import" "^7.8.0"

"@babel/plugin-proposal-json-strings@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-json-strings/-/plugin-proposal-json-strings-7.8.3.tgz#da5216b238a98b58a1e05d6852104b10f9a70d6b"
  integrity sha512-KGhQNZ3TVCQG/MjRbAUwuH+14y9q0tpxs1nWWs3pbSleRdDro9SAMMDyye8HhY1gqZ7/NqIc8SKhya0wRDgP1Q==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-json-strings" "^7.8.0"

"@babel/plugin-proposal-nullish-coalescing-operator@7.8.3", "@babel/plugin-proposal-nullish-coalescing-operator@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-nullish-coalescing-operator/-/plugin-proposal-nullish-coalescing-operator-7.8.3.tgz#e4572253fdeed65cddeecfdab3f928afeb2fd5d2"
  integrity sha512-TS9MlfzXpXKt6YYomudb/KU7nQI6/xnapG6in1uZxoxDghuSMZsPb6D2fyUwNYSAp4l1iR7QtFOjkqcRYcUsfw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-nullish-coalescing-operator" "^7.8.0"

"@babel/plugin-proposal-numeric-separator@7.8.3", "@babel/plugin-proposal-numeric-separator@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-numeric-separator/-/plugin-proposal-numeric-separator-7.8.3.tgz#5d6769409699ec9b3b68684cd8116cedff93bad8"
  integrity sha512-jWioO1s6R/R+wEHizfaScNsAx+xKgwTLNXSh7tTC4Usj3ItsPEhYkEpU4h+lpnBwq7NBVOJXfO6cRFYcX69JUQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-numeric-separator" "^7.8.3"

"@babel/plugin-proposal-object-rest-spread@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-object-rest-spread/-/plugin-proposal-object-rest-spread-7.9.0.tgz#a28993699fc13df165995362693962ba6b061d6f"
  integrity sha512-UgqBv6bjq4fDb8uku9f+wcm1J7YxJ5nT7WO/jBr0cl0PLKb7t1O6RNR1kZbjgx2LQtsDI9hwoQVmn0yhXeQyow==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-object-rest-spread" "^7.8.0"

"@babel/plugin-proposal-optional-catch-binding@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-optional-catch-binding/-/plugin-proposal-optional-catch-binding-7.8.3.tgz#9dee96ab1650eed88646ae9734ca167ac4a9c5c9"
  integrity sha512-0gkX7J7E+AtAw9fcwlVQj8peP61qhdg/89D5swOkjYbkboA2CVckn3kiyum1DE0wskGb7KJJxBdyEBApDLLVdw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-optional-catch-binding" "^7.8.0"

"@babel/plugin-proposal-optional-chaining@7.9.0", "@babel/plugin-proposal-optional-chaining@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-optional-chaining/-/plugin-proposal-optional-chaining-7.9.0.tgz#31db16b154c39d6b8a645292472b98394c292a58"
  integrity sha512-NDn5tu3tcv4W30jNhmc2hyD5c56G6cXx4TesJubhxrJeCvuuMpttxr0OnNCqbZGhFjLrg+NIhxxC+BK5F6yS3w==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-optional-chaining" "^7.8.0"

"@babel/plugin-proposal-unicode-property-regex@^7.4.4", "@babel/plugin-proposal-unicode-property-regex@^7.8.3":
  version "7.8.8"
  resolved "https://registry.yarnpkg.com/@babel/plugin-proposal-unicode-property-regex/-/plugin-proposal-unicode-property-regex-7.8.8.tgz#ee3a95e90cdc04fe8cd92ec3279fa017d68a0d1d"
  integrity sha512-EVhjVsMpbhLw9ZfHWSx2iy13Q8Z/eg8e8ccVWt23sWQK5l1UdkoLJPN5w69UA4uITGBnEZD2JOe4QOHycYKv8A==
  dependencies:
    "@babel/helper-create-regexp-features-plugin" "^7.8.8"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-syntax-async-generators@^7.8.0":
  version "7.8.4"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-async-generators/-/plugin-syntax-async-generators-7.8.4.tgz#a983fb1aeb2ec3f6ed042a210f640e90e786fe0d"
  integrity sha512-tycmZxkGfZaxhMRbXlPXuVFpdWlXpir2W4AMhSJgRKzk/eDlIXOhb2LHWoLpDF7TEHylV5zNhykX6KAgHJmTNw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.0"

"@babel/plugin-syntax-decorators@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-decorators/-/plugin-syntax-decorators-7.8.3.tgz#8d2c15a9f1af624b0025f961682a9d53d3001bda"
  integrity sha512-8Hg4dNNT9/LcA1zQlfwuKR8BUc/if7Q7NkTam9sGTcJphLwpf2g4S42uhspQrIrR+dpzE0dtTqBVFoHl8GtnnQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-syntax-dynamic-import@^7.8.0":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-dynamic-import/-/plugin-syntax-dynamic-import-7.8.3.tgz#62bf98b2da3cd21d626154fc96ee5b3cb68eacb3"
  integrity sha512-5gdGbFon+PszYzqs83S3E5mpi7/y/8M9eC90MRTZfduQOYW76ig6SOSPNe41IG5LoP3FGBn2N0RjVDSQiS94kQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.0"

"@babel/plugin-syntax-flow@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-flow/-/plugin-syntax-flow-7.8.3.tgz#f2c883bd61a6316f2c89380ae5122f923ba4527f"
  integrity sha512-innAx3bUbA0KSYj2E2MNFSn9hiCeowOFLxlsuhXzw8hMQnzkDomUr9QCD7E9VF60NmnG1sNTuuv6Qf4f8INYsg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-syntax-json-strings@^7.8.0":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-json-strings/-/plugin-syntax-json-strings-7.8.3.tgz#01ca21b668cd8218c9e640cb6dd88c5412b2c96a"
  integrity sha512-lY6kdGpWHvjoe2vk4WrAapEuBR69EMxZl+RoGRhrFGNYVK8mOPAW8VfbT/ZgrFbXlDNiiaxQnAtgVCZ6jv30EA==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.0"

"@babel/plugin-syntax-jsx@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-jsx/-/plugin-syntax-jsx-7.8.3.tgz#521b06c83c40480f1e58b4fd33b92eceb1d6ea94"
  integrity sha512-WxdW9xyLgBdefoo0Ynn3MRSkhe5tFVxxKNVdnZSh318WrG2e2jH+E9wd/++JsqcLJZPfz87njQJ8j2Upjm0M0A==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-syntax-nullish-coalescing-operator@^7.8.0":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-nullish-coalescing-operator/-/plugin-syntax-nullish-coalescing-operator-7.8.3.tgz#167ed70368886081f74b5c36c65a88c03b66d1a9"
  integrity sha512-aSff4zPII1u2QD7y+F8oDsz19ew4IGEJg9SVW+bqwpwtfFleiQDMdzA/R+UlWDzfnHFCxxleFT0PMIrR36XLNQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.0"

"@babel/plugin-syntax-numeric-separator@^7.8.0", "@babel/plugin-syntax-numeric-separator@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-numeric-separator/-/plugin-syntax-numeric-separator-7.8.3.tgz#0e3fb63e09bea1b11e96467271c8308007e7c41f"
  integrity sha512-H7dCMAdN83PcCmqmkHB5dtp+Xa9a6LKSvA2hiFBC/5alSHxM5VgWZXFqDi0YFe8XNGT6iCa+z4V4zSt/PdZ7Dw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-syntax-object-rest-spread@^7.0.0", "@babel/plugin-syntax-object-rest-spread@^7.8.0":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-object-rest-spread/-/plugin-syntax-object-rest-spread-7.8.3.tgz#60e225edcbd98a640332a2e72dd3e66f1af55871"
  integrity sha512-XoqMijGZb9y3y2XskN+P1wUGiVwWZ5JmoDRwx5+3GmEplNyVM2s2Dg8ILFQm8rWM48orGy5YpI5Bl8U1y7ydlA==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.0"

"@babel/plugin-syntax-optional-catch-binding@^7.8.0":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-optional-catch-binding/-/plugin-syntax-optional-catch-binding-7.8.3.tgz#6111a265bcfb020eb9efd0fdfd7d26402b9ed6c1"
  integrity sha512-6VPD0Pc1lpTqw0aKoeRTMiB+kWhAoT24PA+ksWSBrFtl5SIRVpZlwN3NNPQjehA2E/91FV3RjLWoVTglWcSV3Q==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.0"

"@babel/plugin-syntax-optional-chaining@^7.8.0":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-optional-chaining/-/plugin-syntax-optional-chaining-7.8.3.tgz#4f69c2ab95167e0180cd5336613f8c5788f7d48a"
  integrity sha512-KoK9ErH1MBlCPxV0VANkXW2/dw4vlbGDrFgz8bmUsBGYkFRcbRwMh6cIJubdPrkxRwuGdtCk0v/wPTKbQgBjkg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.0"

"@babel/plugin-syntax-top-level-await@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-top-level-await/-/plugin-syntax-top-level-await-7.8.3.tgz#3acdece695e6b13aaf57fc291d1a800950c71391"
  integrity sha512-kwj1j9lL/6Wd0hROD3b/OZZ7MSrZLqqn9RAZ5+cYYsflQ9HZBIKCUkr3+uL1MEJ1NePiUbf98jjiMQSv0NMR9g==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-syntax-typescript@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-syntax-typescript/-/plugin-syntax-typescript-7.8.3.tgz#c1f659dda97711a569cef75275f7e15dcaa6cabc"
  integrity sha512-GO1MQ/SGGGoiEXY0e0bSpHimJvxqB7lktLLIq2pv8xG7WZ8IMEle74jIe1FhprHBWjwjZtXHkycDLZXIWM5Wfg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-arrow-functions@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-arrow-functions/-/plugin-transform-arrow-functions-7.8.3.tgz#82776c2ed0cd9e1a49956daeb896024c9473b8b6"
  integrity sha512-0MRF+KC8EqH4dbuITCWwPSzsyO3HIWWlm30v8BbbpOrS1B++isGxPnnuq/IZvOX5J2D/p7DQalQm+/2PnlKGxg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-async-to-generator@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-async-to-generator/-/plugin-transform-async-to-generator-7.8.3.tgz#4308fad0d9409d71eafb9b1a6ee35f9d64b64086"
  integrity sha512-imt9tFLD9ogt56Dd5CI/6XgpukMwd/fLGSrix2httihVe7LOGVPhyhMh1BU5kDM7iHD08i8uUtmV2sWaBFlHVQ==
  dependencies:
    "@babel/helper-module-imports" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/helper-remap-async-to-generator" "^7.8.3"

"@babel/plugin-transform-block-scoped-functions@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-block-scoped-functions/-/plugin-transform-block-scoped-functions-7.8.3.tgz#437eec5b799b5852072084b3ae5ef66e8349e8a3"
  integrity sha512-vo4F2OewqjbB1+yaJ7k2EJFHlTP3jR634Z9Cj9itpqNjuLXvhlVxgnjsHsdRgASR8xYDrx6onw4vW5H6We0Jmg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-block-scoping@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-block-scoping/-/plugin-transform-block-scoping-7.8.3.tgz#97d35dab66857a437c166358b91d09050c868f3a"
  integrity sha512-pGnYfm7RNRgYRi7bids5bHluENHqJhrV4bCZRwc5GamaWIIs07N4rZECcmJL6ZClwjDz1GbdMZFtPs27hTB06w==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    lodash "^4.17.13"

"@babel/plugin-transform-classes@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-classes/-/plugin-transform-classes-7.9.0.tgz#ab89c175ecf5b4c8911194aa8657966615324ce9"
  integrity sha512-xt/0CuBRBsBkqfk95ILxf0ge3gnXjEhOHrNxIiS8fdzSWgecuf9Vq2ogLUfaozJgt3LDO49ThMVWiyezGkei7A==
  dependencies:
    "@babel/helper-annotate-as-pure" "^7.8.3"
    "@babel/helper-define-map" "^7.8.3"
    "@babel/helper-function-name" "^7.8.3"
    "@babel/helper-optimise-call-expression" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/helper-replace-supers" "^7.8.6"
    "@babel/helper-split-export-declaration" "^7.8.3"
    globals "^11.1.0"

"@babel/plugin-transform-computed-properties@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-computed-properties/-/plugin-transform-computed-properties-7.8.3.tgz#96d0d28b7f7ce4eb5b120bb2e0e943343c86f81b"
  integrity sha512-O5hiIpSyOGdrQZRQ2ccwtTVkgUDBBiCuK//4RJ6UfePllUTCENOzKxfh6ulckXKc0DixTFLCfb2HVkNA7aDpzA==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-destructuring@^7.8.3":
  version "7.8.8"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-destructuring/-/plugin-transform-destructuring-7.8.8.tgz#fadb2bc8e90ccaf5658de6f8d4d22ff6272a2f4b"
  integrity sha512-eRJu4Vs2rmttFCdhPUM3bV0Yo/xPSdPw6ML9KHs/bjB4bLA5HXlbvYXPOD5yASodGod+krjYx21xm1QmL8dCJQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-dotall-regex@^7.4.4", "@babel/plugin-transform-dotall-regex@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-dotall-regex/-/plugin-transform-dotall-regex-7.8.3.tgz#c3c6ec5ee6125c6993c5cbca20dc8621a9ea7a6e"
  integrity sha512-kLs1j9Nn4MQoBYdRXH6AeaXMbEJFaFu/v1nQkvib6QzTj8MZI5OQzqmD83/2jEM1z0DLilra5aWO5YpyC0ALIw==
  dependencies:
    "@babel/helper-create-regexp-features-plugin" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-duplicate-keys@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-duplicate-keys/-/plugin-transform-duplicate-keys-7.8.3.tgz#8d12df309aa537f272899c565ea1768e286e21f1"
  integrity sha512-s8dHiBUbcbSgipS4SMFuWGqCvyge5V2ZeAWzR6INTVC3Ltjig/Vw1G2Gztv0vU/hRG9X8IvKvYdoksnUfgXOEQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-exponentiation-operator@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-exponentiation-operator/-/plugin-transform-exponentiation-operator-7.8.3.tgz#581a6d7f56970e06bf51560cd64f5e947b70d7b7"
  integrity sha512-zwIpuIymb3ACcInbksHaNcR12S++0MDLKkiqXHl3AzpgdKlFNhog+z/K0+TGW+b0w5pgTq4H6IwV/WhxbGYSjQ==
  dependencies:
    "@babel/helper-builder-binary-assignment-operator-visitor" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-flow-strip-types@7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-flow-strip-types/-/plugin-transform-flow-strip-types-7.9.0.tgz#8a3538aa40434e000b8f44a3c5c9ac7229bd2392"
  integrity sha512-7Qfg0lKQhEHs93FChxVLAvhBshOPQDtJUTVHr/ZwQNRccCm4O9D79r9tVSoV8iNwjP1YgfD+e/fgHcPkN1qEQg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-flow" "^7.8.3"

"@babel/plugin-transform-for-of@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-for-of/-/plugin-transform-for-of-7.9.0.tgz#0f260e27d3e29cd1bb3128da5e76c761aa6c108e"
  integrity sha512-lTAnWOpMwOXpyDx06N+ywmF3jNbafZEqZ96CGYabxHrxNX8l5ny7dt4bK/rGwAh9utyP2b2Hv7PlZh1AAS54FQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-function-name@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-function-name/-/plugin-transform-function-name-7.8.3.tgz#279373cb27322aaad67c2683e776dfc47196ed8b"
  integrity sha512-rO/OnDS78Eifbjn5Py9v8y0aR+aSYhDhqAwVfsTl0ERuMZyr05L1aFSCJnbv2mmsLkit/4ReeQ9N2BgLnOcPCQ==
  dependencies:
    "@babel/helper-function-name" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-literals@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-literals/-/plugin-transform-literals-7.8.3.tgz#aef239823d91994ec7b68e55193525d76dbd5dc1"
  integrity sha512-3Tqf8JJ/qB7TeldGl+TT55+uQei9JfYaregDcEAyBZ7akutriFrt6C/wLYIer6OYhleVQvH/ntEhjE/xMmy10A==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-member-expression-literals@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-member-expression-literals/-/plugin-transform-member-expression-literals-7.8.3.tgz#963fed4b620ac7cbf6029c755424029fa3a40410"
  integrity sha512-3Wk2EXhnw+rP+IDkK6BdtPKsUE5IeZ6QOGrPYvw52NwBStw9V1ZVzxgK6fSKSxqUvH9eQPR3tm3cOq79HlsKYA==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-modules-amd@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-modules-amd/-/plugin-transform-modules-amd-7.9.0.tgz#19755ee721912cf5bb04c07d50280af3484efef4"
  integrity sha512-vZgDDF003B14O8zJy0XXLnPH4sg+9X5hFBBGN1V+B2rgrB+J2xIypSN6Rk9imB2hSTHQi5OHLrFWsZab1GMk+Q==
  dependencies:
    "@babel/helper-module-transforms" "^7.9.0"
    "@babel/helper-plugin-utils" "^7.8.3"
    babel-plugin-dynamic-import-node "^2.3.0"

"@babel/plugin-transform-modules-commonjs@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-modules-commonjs/-/plugin-transform-modules-commonjs-7.9.0.tgz#e3e72f4cbc9b4a260e30be0ea59bdf5a39748940"
  integrity sha512-qzlCrLnKqio4SlgJ6FMMLBe4bySNis8DFn1VkGmOcxG9gqEyPIOzeQrA//u0HAKrWpJlpZbZMPB1n/OPa4+n8g==
  dependencies:
    "@babel/helper-module-transforms" "^7.9.0"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/helper-simple-access" "^7.8.3"
    babel-plugin-dynamic-import-node "^2.3.0"

"@babel/plugin-transform-modules-systemjs@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-modules-systemjs/-/plugin-transform-modules-systemjs-7.9.0.tgz#e9fd46a296fc91e009b64e07ddaa86d6f0edeb90"
  integrity sha512-FsiAv/nao/ud2ZWy4wFacoLOm5uxl0ExSQ7ErvP7jpoihLR6Cq90ilOFyX9UXct3rbtKsAiZ9kFt5XGfPe/5SQ==
  dependencies:
    "@babel/helper-hoist-variables" "^7.8.3"
    "@babel/helper-module-transforms" "^7.9.0"
    "@babel/helper-plugin-utils" "^7.8.3"
    babel-plugin-dynamic-import-node "^2.3.0"

"@babel/plugin-transform-modules-umd@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-modules-umd/-/plugin-transform-modules-umd-7.9.0.tgz#e909acae276fec280f9b821a5f38e1f08b480697"
  integrity sha512-uTWkXkIVtg/JGRSIABdBoMsoIeoHQHPTL0Y2E7xf5Oj7sLqwVsNXOkNk0VJc7vF0IMBsPeikHxFjGe+qmwPtTQ==
  dependencies:
    "@babel/helper-module-transforms" "^7.9.0"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-named-capturing-groups-regex@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-named-capturing-groups-regex/-/plugin-transform-named-capturing-groups-regex-7.8.3.tgz#a2a72bffa202ac0e2d0506afd0939c5ecbc48c6c"
  integrity sha512-f+tF/8UVPU86TrCb06JoPWIdDpTNSGGcAtaD9mLP0aYGA0OS0j7j7DHJR0GTFrUZPUU6loZhbsVZgTh0N+Qdnw==
  dependencies:
    "@babel/helper-create-regexp-features-plugin" "^7.8.3"

"@babel/plugin-transform-new-target@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-new-target/-/plugin-transform-new-target-7.8.3.tgz#60cc2ae66d85c95ab540eb34babb6434d4c70c43"
  integrity sha512-QuSGysibQpyxexRyui2vca+Cmbljo8bcRckgzYV4kRIsHpVeyeC3JDO63pY+xFZ6bWOBn7pfKZTqV4o/ix9sFw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-object-super@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-object-super/-/plugin-transform-object-super-7.8.3.tgz#ebb6a1e7a86ffa96858bd6ac0102d65944261725"
  integrity sha512-57FXk+gItG/GejofIyLIgBKTas4+pEU47IXKDBWFTxdPd7F80H8zybyAY7UoblVfBhBGs2EKM+bJUu2+iUYPDQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/helper-replace-supers" "^7.8.3"

"@babel/plugin-transform-parameters@^7.8.7":
  version "7.8.8"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-parameters/-/plugin-transform-parameters-7.8.8.tgz#0381de466c85d5404565243660c4496459525daf"
  integrity sha512-hC4Ld/Ulpf1psQciWWwdnUspQoQco2bMzSrwU6TmzRlvoYQe4rQFy9vnCZDTlVeCQj0JPfL+1RX0V8hCJvkgBA==
  dependencies:
    "@babel/helper-call-delegate" "^7.8.7"
    "@babel/helper-get-function-arity" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-property-literals@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-property-literals/-/plugin-transform-property-literals-7.8.3.tgz#33194300d8539c1ed28c62ad5087ba3807b98263"
  integrity sha512-uGiiXAZMqEoQhRWMK17VospMZh5sXWg+dlh2soffpkAl96KAm+WZuJfa6lcELotSRmooLqg0MWdH6UUq85nmmg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-react-constant-elements@^7.0.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-react-constant-elements/-/plugin-transform-react-constant-elements-7.9.0.tgz#a75abc936a3819edec42d3386d9f1c93f28d9d9e"
  integrity sha512-wXMXsToAUOxJuBBEHajqKLFWcCkOSLshTI2ChCFFj1zDd7od4IOxiwLCOObNUvOpkxLpjIuaIdBMmNt6ocCPAw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-react-display-name@7.8.3", "@babel/plugin-transform-react-display-name@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-react-display-name/-/plugin-transform-react-display-name-7.8.3.tgz#70ded987c91609f78353dd76d2fb2a0bb991e8e5"
  integrity sha512-3Jy/PCw8Fe6uBKtEgz3M82ljt+lTg+xJaM4og+eyu83qLT87ZUSckn0wy7r31jflURWLO83TW6Ylf7lyXj3m5A==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-react-jsx-development@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-react-jsx-development/-/plugin-transform-react-jsx-development-7.9.0.tgz#3c2a130727caf00c2a293f0aed24520825dbf754"
  integrity sha512-tK8hWKrQncVvrhvtOiPpKrQjfNX3DtkNLSX4ObuGcpS9p0QrGetKmlySIGR07y48Zft8WVgPakqd/bk46JrMSw==
  dependencies:
    "@babel/helper-builder-react-jsx-experimental" "^7.9.0"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-jsx" "^7.8.3"

"@babel/plugin-transform-react-jsx-self@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-react-jsx-self/-/plugin-transform-react-jsx-self-7.9.0.tgz#f4f26a325820205239bb915bad8e06fcadabb49b"
  integrity sha512-K2ObbWPKT7KUTAoyjCsFilOkEgMvFG+y0FqOl6Lezd0/13kMkkjHskVsZvblRPj1PHA44PrToaZANrryppzTvQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-jsx" "^7.8.3"

"@babel/plugin-transform-react-jsx-source@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-react-jsx-source/-/plugin-transform-react-jsx-source-7.9.0.tgz#89ef93025240dd5d17d3122294a093e5e0183de0"
  integrity sha512-K6m3LlSnTSfRkM6FcRk8saNEeaeyG5k7AVkBU2bZK3+1zdkSED3qNdsWrUgQBeTVD2Tp3VMmerxVO2yM5iITmw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-jsx" "^7.8.3"

"@babel/plugin-transform-react-jsx@^7.9.1":
  version "7.9.1"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-react-jsx/-/plugin-transform-react-jsx-7.9.1.tgz#d03af29396a6dc51bfa24eefd8005a9fd381152a"
  integrity sha512-+xIZ6fPoix7h57CNO/ZeYADchg1tFyX9NDsnmNFFua8e1JNPln156mzS+8AQe1On2X2GLlANHJWHIXbMCqWDkQ==
  dependencies:
    "@babel/helper-builder-react-jsx" "^7.9.0"
    "@babel/helper-builder-react-jsx-experimental" "^7.9.0"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-jsx" "^7.8.3"

"@babel/plugin-transform-regenerator@^7.8.7":
  version "7.8.7"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-regenerator/-/plugin-transform-regenerator-7.8.7.tgz#5e46a0dca2bee1ad8285eb0527e6abc9c37672f8"
  integrity sha512-TIg+gAl4Z0a3WmD3mbYSk+J9ZUH6n/Yc57rtKRnlA/7rcCvpekHXe0CMZHP1gYp7/KLe9GHTuIba0vXmls6drA==
  dependencies:
    regenerator-transform "^0.14.2"

"@babel/plugin-transform-reserved-words@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-reserved-words/-/plugin-transform-reserved-words-7.8.3.tgz#9a0635ac4e665d29b162837dd3cc50745dfdf1f5"
  integrity sha512-mwMxcycN3omKFDjDQUl+8zyMsBfjRFr0Zn/64I41pmjv4NJuqcYlEtezwYtw9TFd9WR1vN5kiM+O0gMZzO6L0A==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-runtime@7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-runtime/-/plugin-transform-runtime-7.9.0.tgz#45468c0ae74cc13204e1d3b1f4ce6ee83258af0b"
  integrity sha512-pUu9VSf3kI1OqbWINQ7MaugnitRss1z533436waNXp+0N3ur3zfut37sXiQMxkuCF4VUjwZucen/quskCh7NHw==
  dependencies:
    "@babel/helper-module-imports" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"
    resolve "^1.8.1"
    semver "^5.5.1"

"@babel/plugin-transform-shorthand-properties@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-shorthand-properties/-/plugin-transform-shorthand-properties-7.8.3.tgz#28545216e023a832d4d3a1185ed492bcfeac08c8"
  integrity sha512-I9DI6Odg0JJwxCHzbzW08ggMdCezoWcuQRz3ptdudgwaHxTjxw5HgdFJmZIkIMlRymL6YiZcped4TTCB0JcC8w==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-spread@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-spread/-/plugin-transform-spread-7.8.3.tgz#9c8ffe8170fdfb88b114ecb920b82fb6e95fe5e8"
  integrity sha512-CkuTU9mbmAoFOI1tklFWYYbzX5qCIZVXPVy0jpXgGwkplCndQAa58s2jr66fTeQnA64bDox0HL4U56CFYoyC7g==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-sticky-regex@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-sticky-regex/-/plugin-transform-sticky-regex-7.8.3.tgz#be7a1290f81dae767475452199e1f76d6175b100"
  integrity sha512-9Spq0vGCD5Bb4Z/ZXXSK5wbbLFMG085qd2vhL1JYu1WcQ5bXqZBAYRzU1d+p79GcHs2szYv5pVQCX13QgldaWw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/helper-regex" "^7.8.3"

"@babel/plugin-transform-template-literals@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-template-literals/-/plugin-transform-template-literals-7.8.3.tgz#7bfa4732b455ea6a43130adc0ba767ec0e402a80"
  integrity sha512-820QBtykIQOLFT8NZOcTRJ1UNuztIELe4p9DCgvj4NK+PwluSJ49we7s9FB1HIGNIYT7wFUJ0ar2QpCDj0escQ==
  dependencies:
    "@babel/helper-annotate-as-pure" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-typeof-symbol@^7.8.4":
  version "7.8.4"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-typeof-symbol/-/plugin-transform-typeof-symbol-7.8.4.tgz#ede4062315ce0aaf8a657a920858f1a2f35fc412"
  integrity sha512-2QKyfjGdvuNfHsb7qnBBlKclbD4CfshH2KvDabiijLMGXPHJXGxtDzwIF7bQP+T0ysw8fYTtxPafgfs/c1Lrqg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/plugin-transform-typescript@^7.9.0":
  version "7.9.4"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-typescript/-/plugin-transform-typescript-7.9.4.tgz#4bb4dde4f10bbf2d787fce9707fb09b483e33359"
  integrity sha512-yeWeUkKx2auDbSxRe8MusAG+n4m9BFY/v+lPjmQDgOFX5qnySkUY5oXzkp6FwPdsYqnKay6lorXYdC0n3bZO7w==
  dependencies:
    "@babel/helper-create-class-features-plugin" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-syntax-typescript" "^7.8.3"

"@babel/plugin-transform-unicode-regex@^7.8.3":
  version "7.8.3"
  resolved "https://registry.yarnpkg.com/@babel/plugin-transform-unicode-regex/-/plugin-transform-unicode-regex-7.8.3.tgz#0cef36e3ba73e5c57273effb182f46b91a1ecaad"
  integrity sha512-+ufgJjYdmWfSQ+6NS9VGUR2ns8cjJjYbrbi11mZBTaWm+Fui/ncTLFF28Ei1okavY+xkojGr1eJxNsWYeA5aZw==
  dependencies:
    "@babel/helper-create-regexp-features-plugin" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"

"@babel/preset-env@7.9.0", "@babel/preset-env@^7.4.5":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/preset-env/-/preset-env-7.9.0.tgz#a5fc42480e950ae8f5d9f8f2bbc03f52722df3a8"
  integrity sha512-712DeRXT6dyKAM/FMbQTV/FvRCms2hPCx+3weRjZ8iQVQWZejWWk1wwG6ViWMyqb/ouBbGOl5b6aCk0+j1NmsQ==
  dependencies:
    "@babel/compat-data" "^7.9.0"
    "@babel/helper-compilation-targets" "^7.8.7"
    "@babel/helper-module-imports" "^7.8.3"
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-proposal-async-generator-functions" "^7.8.3"
    "@babel/plugin-proposal-dynamic-import" "^7.8.3"
    "@babel/plugin-proposal-json-strings" "^7.8.3"
    "@babel/plugin-proposal-nullish-coalescing-operator" "^7.8.3"
    "@babel/plugin-proposal-numeric-separator" "^7.8.3"
    "@babel/plugin-proposal-object-rest-spread" "^7.9.0"
    "@babel/plugin-proposal-optional-catch-binding" "^7.8.3"
    "@babel/plugin-proposal-optional-chaining" "^7.9.0"
    "@babel/plugin-proposal-unicode-property-regex" "^7.8.3"
    "@babel/plugin-syntax-async-generators" "^7.8.0"
    "@babel/plugin-syntax-dynamic-import" "^7.8.0"
    "@babel/plugin-syntax-json-strings" "^7.8.0"
    "@babel/plugin-syntax-nullish-coalescing-operator" "^7.8.0"
    "@babel/plugin-syntax-numeric-separator" "^7.8.0"
    "@babel/plugin-syntax-object-rest-spread" "^7.8.0"
    "@babel/plugin-syntax-optional-catch-binding" "^7.8.0"
    "@babel/plugin-syntax-optional-chaining" "^7.8.0"
    "@babel/plugin-syntax-top-level-await" "^7.8.3"
    "@babel/plugin-transform-arrow-functions" "^7.8.3"
    "@babel/plugin-transform-async-to-generator" "^7.8.3"
    "@babel/plugin-transform-block-scoped-functions" "^7.8.3"
    "@babel/plugin-transform-block-scoping" "^7.8.3"
    "@babel/plugin-transform-classes" "^7.9.0"
    "@babel/plugin-transform-computed-properties" "^7.8.3"
    "@babel/plugin-transform-destructuring" "^7.8.3"
    "@babel/plugin-transform-dotall-regex" "^7.8.3"
    "@babel/plugin-transform-duplicate-keys" "^7.8.3"
    "@babel/plugin-transform-exponentiation-operator" "^7.8.3"
    "@babel/plugin-transform-for-of" "^7.9.0"
    "@babel/plugin-transform-function-name" "^7.8.3"
    "@babel/plugin-transform-literals" "^7.8.3"
    "@babel/plugin-transform-member-expression-literals" "^7.8.3"
    "@babel/plugin-transform-modules-amd" "^7.9.0"
    "@babel/plugin-transform-modules-commonjs" "^7.9.0"
    "@babel/plugin-transform-modules-systemjs" "^7.9.0"
    "@babel/plugin-transform-modules-umd" "^7.9.0"
    "@babel/plugin-transform-named-capturing-groups-regex" "^7.8.3"
    "@babel/plugin-transform-new-target" "^7.8.3"
    "@babel/plugin-transform-object-super" "^7.8.3"
    "@babel/plugin-transform-parameters" "^7.8.7"
    "@babel/plugin-transform-property-literals" "^7.8.3"
    "@babel/plugin-transform-regenerator" "^7.8.7"
    "@babel/plugin-transform-reserved-words" "^7.8.3"
    "@babel/plugin-transform-shorthand-properties" "^7.8.3"
    "@babel/plugin-transform-spread" "^7.8.3"
    "@babel/plugin-transform-sticky-regex" "^7.8.3"
    "@babel/plugin-transform-template-literals" "^7.8.3"
    "@babel/plugin-transform-typeof-symbol" "^7.8.4"
    "@babel/plugin-transform-unicode-regex" "^7.8.3"
    "@babel/preset-modules" "^0.1.3"
    "@babel/types" "^7.9.0"
    browserslist "^4.9.1"
    core-js-compat "^3.6.2"
    invariant "^2.2.2"
    levenary "^1.1.1"
    semver "^5.5.0"

"@babel/preset-modules@^0.1.3":
  version "0.1.3"
  resolved "https://registry.yarnpkg.com/@babel/preset-modules/-/preset-modules-0.1.3.tgz#13242b53b5ef8c883c3cf7dddd55b36ce80fbc72"
  integrity sha512-Ra3JXOHBq2xd56xSF7lMKXdjBn3T772Y1Wet3yWnkDly9zHvJki029tAFzvAAK5cf4YV3yoxuP61crYRol6SVg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.0.0"
    "@babel/plugin-proposal-unicode-property-regex" "^7.4.4"
    "@babel/plugin-transform-dotall-regex" "^7.4.4"
    "@babel/types" "^7.4.4"
    esutils "^2.0.2"

"@babel/preset-react@7.9.1", "@babel/preset-react@^7.0.0":
  version "7.9.1"
  resolved "https://registry.yarnpkg.com/@babel/preset-react/-/preset-react-7.9.1.tgz#b346403c36d58c3bb544148272a0cefd9c28677a"
  integrity sha512-aJBYF23MPj0RNdp/4bHnAP0NVqqZRr9kl0NAOP4nJCex6OYVio59+dnQzsAWFuogdLyeaKA1hmfUIVZkY5J+TQ==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-transform-react-display-name" "^7.8.3"
    "@babel/plugin-transform-react-jsx" "^7.9.1"
    "@babel/plugin-transform-react-jsx-development" "^7.9.0"
    "@babel/plugin-transform-react-jsx-self" "^7.9.0"
    "@babel/plugin-transform-react-jsx-source" "^7.9.0"

"@babel/preset-typescript@7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/preset-typescript/-/preset-typescript-7.9.0.tgz#87705a72b1f0d59df21c179f7c3d2ef4b16ce192"
  integrity sha512-S4cueFnGrIbvYJgwsVFKdvOmpiL0XGw9MFW9D0vgRys5g36PBhZRL8NX8Gr2akz8XRtzq6HuDXPD/1nniagNUg==
  dependencies:
    "@babel/helper-plugin-utils" "^7.8.3"
    "@babel/plugin-transform-typescript" "^7.9.0"

"@babel/runtime-corejs3@^7.7.4":
  version "7.9.2"
  resolved "https://registry.yarnpkg.com/@babel/runtime-corejs3/-/runtime-corejs3-7.9.2.tgz#26fe4aa77e9f1ecef9b776559bbb8e84d34284b7"
  integrity sha512-HHxmgxbIzOfFlZ+tdeRKtaxWOMUoCG5Mu3wKeUmOxjYrwb3AAHgnmtCUbPPK11/raIWLIBK250t8E2BPO0p7jA==
  dependencies:
    core-js-pure "^3.0.0"
    regenerator-runtime "^0.13.4"

"@babel/runtime-corejs3@^7.8.3":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/runtime-corejs3/-/runtime-corejs3-7.9.0.tgz#0d4119c44ad05bfa0ca16f2f4f91cde430056c08"
  integrity sha512-Fe3z3yVZNCUTaOFBAofwkEtFiYi7a7Gg2F5S1QX+mqP403i2iKJtyHJYEp/PV2ijUheT0PiKWbmXcqtwLhmBzg==
  dependencies:
    core-js-pure "^3.0.0"
    regenerator-runtime "^0.13.4"

"@babel/runtime@7.9.0", "@babel/runtime@^7.0.0", "@babel/runtime@^7.3.4", "@babel/runtime@^7.4.5", "@babel/runtime@^7.7.2", "@babel/runtime@^7.8.4", "@babel/runtime@^7.8.7":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/runtime/-/runtime-7.9.0.tgz#337eda67401f5b066a6f205a3113d4ac18ba495b"
  integrity sha512-cTIudHnzuWLS56ik4DnRnqqNf8MkdUzV4iFFI1h7Jo9xvrpQROYaAnaSd2mHLQAzzZAPfATynX5ord6YlNYNMA==
  dependencies:
    regenerator-runtime "^0.13.4"

"@babel/runtime@^7.5.1", "@babel/runtime@^7.7.4":
  version "7.9.2"
  resolved "https://registry.yarnpkg.com/@babel/runtime/-/runtime-7.9.2.tgz#d90df0583a3a252f09aaa619665367bae518db06"
  integrity sha512-NE2DtOdufG7R5vnfQUTehdTfNycfUANEtCa9PssN9O/xmTzP4E08UI797ixaei6hBEVL9BI/PsdJS5x7mWoB9Q==
  dependencies:
    regenerator-runtime "^0.13.4"

"@babel/template@^7.4.0", "@babel/template@^7.8.3", "@babel/template@^7.8.6":
  version "7.8.6"
  resolved "https://registry.yarnpkg.com/@babel/template/-/template-7.8.6.tgz#86b22af15f828dfb086474f964dcc3e39c43ce2b"
  integrity sha512-zbMsPMy/v0PWFZEhQJ66bqjhH+z0JgMoBWuikXybgG3Gkd/3t5oQ1Rw2WQhnSrsOmsKXnZOx15tkC4qON/+JPg==
  dependencies:
    "@babel/code-frame" "^7.8.3"
    "@babel/parser" "^7.8.6"
    "@babel/types" "^7.8.6"

"@babel/traverse@^7.1.0", "@babel/traverse@^7.4.3", "@babel/traverse@^7.7.0", "@babel/traverse@^7.8.3", "@babel/traverse@^7.8.6", "@babel/traverse@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/traverse/-/traverse-7.9.0.tgz#d3882c2830e513f4fe4cec9fe76ea1cc78747892"
  integrity sha512-jAZQj0+kn4WTHO5dUZkZKhbFrqZE7K5LAQ5JysMnmvGij+wOdr+8lWqPeW0BcF4wFwrEXXtdGO7wcV6YPJcf3w==
  dependencies:
    "@babel/code-frame" "^7.8.3"
    "@babel/generator" "^7.9.0"
    "@babel/helper-function-name" "^7.8.3"
    "@babel/helper-split-export-declaration" "^7.8.3"
    "@babel/parser" "^7.9.0"
    "@babel/types" "^7.9.0"
    debug "^4.1.0"
    globals "^11.1.0"
    lodash "^4.17.13"

"@babel/types@^7.0.0", "@babel/types@^7.3.0", "@babel/types@^7.4.0", "@babel/types@^7.4.4", "@babel/types@^7.7.0", "@babel/types@^7.8.3", "@babel/types@^7.8.6", "@babel/types@^7.8.7", "@babel/types@^7.9.0":
  version "7.9.0"
  resolved "https://registry.yarnpkg.com/@babel/types/-/types-7.9.0.tgz#00b064c3df83ad32b2dbf5ff07312b15c7f1efb5"
  integrity sha512-BS9JKfXkzzJl8RluW4JGknzpiUV7ZrvTayM6yfqLTVBEnFtyowVIOu6rqxRd5cVO6yGoWf4T8u8dgK9oB+GCng==
  dependencies:
    "@babel/helper-validator-identifier" "^7.9.0"
    lodash "^4.17.13"
    to-fast-properties "^2.0.0"

"@cnakazawa/watch@^1.0.3":
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/@cnakazawa/watch/-/watch-1.0.4.tgz#f864ae85004d0fcab6f50be9141c4da368d1656a"
  integrity sha512-v9kIhKwjeZThiWrLmj0y17CWoyddASLj9O2yvbZkbvw/N3rWOYy9zkV66ursAoVr0mV15bL8g0c4QZUE6cdDoQ==
  dependencies:
    exec-sh "^0.3.2"
    minimist "^1.2.0"

"@csstools/convert-colors@^1.4.0":
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/@csstools/convert-colors/-/convert-colors-1.4.0.tgz#ad495dc41b12e75d588c6db8b9834f08fa131eb7"
  integrity sha512-5a6wqoJV/xEdbRNKVo6I4hO3VjyDq//8q2f9I6PBAvMesJHFauXDorcNCsr9RzvsZnaWi5NYCcfyqP1QeFHFbw==

"@csstools/normalize.css@^10.1.0":
  version "10.1.0"
  resolved "https://registry.yarnpkg.com/@csstools/normalize.css/-/normalize.css-10.1.0.tgz#f0950bba18819512d42f7197e56c518aa491cf18"
  integrity sha512-ij4wRiunFfaJxjB0BdrYHIH8FxBJpOwNPhhAcunlmPdXudL1WQV1qoP9un6JsEBAgQH+7UXyyjh0g7jTxXK6tg==

"@hapi/address@2.x.x":
  version "2.1.4"
  resolved "https://registry.yarnpkg.com/@hapi/address/-/address-2.1.4.tgz#5d67ed43f3fd41a69d4b9ff7b56e7c0d1d0a81e5"
  integrity sha512-QD1PhQk+s31P1ixsX0H0Suoupp3VMXzIVMSwobR3F3MSUO2YCV0B7xqLcUw/Bh8yuvd3LhpyqLQWTNcRmp6IdQ==

"@hapi/bourne@1.x.x":
  version "1.3.2"
  resolved "https://registry.yarnpkg.com/@hapi/bourne/-/bourne-1.3.2.tgz#0a7095adea067243ce3283e1b56b8a8f453b242a"
  integrity sha512-1dVNHT76Uu5N3eJNTYcvxee+jzX4Z9lfciqRRHCU27ihbUcYi+iSc2iml5Ke1LXe1SyJCLA0+14Jh4tXJgOppA==

"@hapi/hoek@8.x.x", "@hapi/hoek@^8.3.0":
  version "8.5.1"
  resolved "https://registry.yarnpkg.com/@hapi/hoek/-/hoek-8.5.1.tgz#fde96064ca446dec8c55a8c2f130957b070c6e06"
  integrity sha512-yN7kbciD87WzLGc5539Tn0sApjyiGHAJgKvG9W8C7O+6c7qmoQMfVs0W4bX17eqz6C78QJqqFrtgdK5EWf6Qow==

"@hapi/joi@^15.0.0":
  version "15.1.1"
  resolved "https://registry.yarnpkg.com/@hapi/joi/-/joi-15.1.1.tgz#c675b8a71296f02833f8d6d243b34c57b8ce19d7"
  integrity sha512-entf8ZMOK8sc+8YfeOlM8pCfg3b5+WZIKBfUaaJT8UsjAAPjartzxIYm3TIbjvA4u+u++KbcXD38k682nVHDAQ==
  dependencies:
    "@hapi/address" "2.x.x"
    "@hapi/bourne" "1.x.x"
    "@hapi/hoek" "8.x.x"
    "@hapi/topo" "3.x.x"

"@hapi/topo@3.x.x":
  version "3.1.6"
  resolved "https://registry.yarnpkg.com/@hapi/topo/-/topo-3.1.6.tgz#68d935fa3eae7fdd5ab0d7f953f3205d8b2bfc29"
  integrity sha512-tAag0jEcjwH+P2quUfipd7liWCNX2F8NvYjQp2wtInsZxnMlypdw0FtAOLxtvvkO+GSRRbmNi8m/5y42PQJYCQ==
  dependencies:
    "@hapi/hoek" "^8.3.0"

"@jest/console@^24.7.1", "@jest/console@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/console/-/console-24.9.0.tgz#79b1bc06fb74a8cfb01cbdedf945584b1b9707f0"
  integrity sha512-Zuj6b8TnKXi3q4ymac8EQfc3ea/uhLeCGThFqXeC8H9/raaH8ARPUTdId+XyGd03Z4In0/VjD2OYFcBF09fNLQ==
  dependencies:
    "@jest/source-map" "^24.9.0"
    chalk "^2.0.1"
    slash "^2.0.0"

"@jest/core@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/core/-/core-24.9.0.tgz#2ceccd0b93181f9c4850e74f2a9ad43d351369c4"
  integrity sha512-Fogg3s4wlAr1VX7q+rhV9RVnUv5tD7VuWfYy1+whMiWUrvl7U3QJSJyWcDio9Lq2prqYsZaeTv2Rz24pWGkJ2A==
  dependencies:
    "@jest/console" "^24.7.1"
    "@jest/reporters" "^24.9.0"
    "@jest/test-result" "^24.9.0"
    "@jest/transform" "^24.9.0"
    "@jest/types" "^24.9.0"
    ansi-escapes "^3.0.0"
    chalk "^2.0.1"
    exit "^0.1.2"
    graceful-fs "^4.1.15"
    jest-changed-files "^24.9.0"
    jest-config "^24.9.0"
    jest-haste-map "^24.9.0"
    jest-message-util "^24.9.0"
    jest-regex-util "^24.3.0"
    jest-resolve "^24.9.0"
    jest-resolve-dependencies "^24.9.0"
    jest-runner "^24.9.0"
    jest-runtime "^24.9.0"
    jest-snapshot "^24.9.0"
    jest-util "^24.9.0"
    jest-validate "^24.9.0"
    jest-watcher "^24.9.0"
    micromatch "^3.1.10"
    p-each-series "^1.0.0"
    realpath-native "^1.1.0"
    rimraf "^2.5.4"
    slash "^2.0.0"
    strip-ansi "^5.0.0"

"@jest/environment@^24.3.0", "@jest/environment@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/environment/-/environment-24.9.0.tgz#21e3afa2d65c0586cbd6cbefe208bafade44ab18"
  integrity sha512-5A1QluTPhvdIPFYnO3sZC3smkNeXPVELz7ikPbhUj0bQjB07EoE9qtLrem14ZUYWdVayYbsjVwIiL4WBIMV4aQ==
  dependencies:
    "@jest/fake-timers" "^24.9.0"
    "@jest/transform" "^24.9.0"
    "@jest/types" "^24.9.0"
    jest-mock "^24.9.0"

"@jest/fake-timers@^24.3.0", "@jest/fake-timers@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/fake-timers/-/fake-timers-24.9.0.tgz#ba3e6bf0eecd09a636049896434d306636540c93"
  integrity sha512-eWQcNa2YSwzXWIMC5KufBh3oWRIijrQFROsIqt6v/NS9Io/gknw1jsAC9c+ih/RQX4A3O7SeWAhQeN0goKhT9A==
  dependencies:
    "@jest/types" "^24.9.0"
    jest-message-util "^24.9.0"
    jest-mock "^24.9.0"

"@jest/reporters@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/reporters/-/reporters-24.9.0.tgz#86660eff8e2b9661d042a8e98a028b8d631a5b43"
  integrity sha512-mu4X0yjaHrffOsWmVLzitKmmmWSQ3GGuefgNscUSWNiUNcEOSEQk9k3pERKEQVBb0Cnn88+UESIsZEMH3o88Gw==
  dependencies:
    "@jest/environment" "^24.9.0"
    "@jest/test-result" "^24.9.0"
    "@jest/transform" "^24.9.0"
    "@jest/types" "^24.9.0"
    chalk "^2.0.1"
    exit "^0.1.2"
    glob "^7.1.2"
    istanbul-lib-coverage "^2.0.2"
    istanbul-lib-instrument "^3.0.1"
    istanbul-lib-report "^2.0.4"
    istanbul-lib-source-maps "^3.0.1"
    istanbul-reports "^2.2.6"
    jest-haste-map "^24.9.0"
    jest-resolve "^24.9.0"
    jest-runtime "^24.9.0"
    jest-util "^24.9.0"
    jest-worker "^24.6.0"
    node-notifier "^5.4.2"
    slash "^2.0.0"
    source-map "^0.6.0"
    string-length "^2.0.0"

"@jest/source-map@^24.3.0", "@jest/source-map@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/source-map/-/source-map-24.9.0.tgz#0e263a94430be4b41da683ccc1e6bffe2a191714"
  integrity sha512-/Xw7xGlsZb4MJzNDgB7PW5crou5JqWiBQaz6xyPd3ArOg2nfn/PunV8+olXbbEZzNl591o5rWKE9BRDaFAuIBg==
  dependencies:
    callsites "^3.0.0"
    graceful-fs "^4.1.15"
    source-map "^0.6.0"

"@jest/test-result@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/test-result/-/test-result-24.9.0.tgz#11796e8aa9dbf88ea025757b3152595ad06ba0ca"
  integrity sha512-XEFrHbBonBJ8dGp2JmF8kP/nQI/ImPpygKHwQ/SY+es59Z3L5PI4Qb9TQQMAEeYsThG1xF0k6tmG0tIKATNiiA==
  dependencies:
    "@jest/console" "^24.9.0"
    "@jest/types" "^24.9.0"
    "@types/istanbul-lib-coverage" "^2.0.0"

"@jest/test-sequencer@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/test-sequencer/-/test-sequencer-24.9.0.tgz#f8f334f35b625a4f2f355f2fe7e6036dad2e6b31"
  integrity sha512-6qqsU4o0kW1dvA95qfNog8v8gkRN9ph6Lz7r96IvZpHdNipP2cBcb07J1Z45mz/VIS01OHJ3pY8T5fUY38tg4A==
  dependencies:
    "@jest/test-result" "^24.9.0"
    jest-haste-map "^24.9.0"
    jest-runner "^24.9.0"
    jest-runtime "^24.9.0"

"@jest/transform@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/transform/-/transform-24.9.0.tgz#4ae2768b296553fadab09e9ec119543c90b16c56"
  integrity sha512-TcQUmyNRxV94S0QpMOnZl0++6RMiqpbH/ZMccFB/amku6Uwvyb1cjYX7xkp5nGNkbX4QPH/FcB6q1HBTHynLmQ==
  dependencies:
    "@babel/core" "^7.1.0"
    "@jest/types" "^24.9.0"
    babel-plugin-istanbul "^5.1.0"
    chalk "^2.0.1"
    convert-source-map "^1.4.0"
    fast-json-stable-stringify "^2.0.0"
    graceful-fs "^4.1.15"
    jest-haste-map "^24.9.0"
    jest-regex-util "^24.9.0"
    jest-util "^24.9.0"
    micromatch "^3.1.10"
    pirates "^4.0.1"
    realpath-native "^1.1.0"
    slash "^2.0.0"
    source-map "^0.6.1"
    write-file-atomic "2.4.1"

"@jest/types@^24.3.0", "@jest/types@^24.9.0":
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/@jest/types/-/types-24.9.0.tgz#63cb26cb7500d069e5a389441a7c6ab5e909fc59"
  integrity sha512-XKK7ze1apu5JWQ5eZjHITP66AX+QsLlbaJRBGYr8pNzwcAE2JVkwnf0yqjHTsDRcjR0mujy/NmZMXw5kl+kGBw==
  dependencies:
    "@types/istanbul-lib-coverage" "^2.0.0"
    "@types/istanbul-reports" "^1.1.1"
    "@types/yargs" "^13.0.0"

"@jest/types@^25.4.0":
  version "25.4.0"
  resolved "https://registry.yarnpkg.com/@jest/types/-/types-25.4.0.tgz#5afeb8f7e1cba153a28e5ac3c9fe3eede7206d59"
  integrity sha512-XBeaWNzw2PPnGW5aXvZt3+VO60M+34RY3XDsCK5tW7kyj3RK0XClRutCfjqcBuaR2aBQTbluEDME9b5MB9UAPw==
  dependencies:
    "@types/istanbul-lib-coverage" "^2.0.0"
    "@types/istanbul-reports" "^1.1.1"
    "@types/yargs" "^15.0.0"
    chalk "^3.0.0"

"@mrmlnc/readdir-enhanced@^2.2.1":
  version "2.2.1"
  resolved "https://registry.yarnpkg.com/@mrmlnc/readdir-enhanced/-/readdir-enhanced-2.2.1.tgz#524af240d1a360527b730475ecfa1344aa540dde"
  integrity sha512-bPHp6Ji8b41szTOcaP63VlnbbO5Ny6dwAATtY6JTjh5N2OLrb5Qk/Th5cRkRQhkWCt+EJsYrNB0MiL+Gpn6e3g==
  dependencies:
    call-me-maybe "^1.0.1"
    glob-to-regexp "^0.3.0"

"@nodelib/fs.stat@^1.1.2":
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/@nodelib/fs.stat/-/fs.stat-1.1.3.tgz#2b5a3ab3f918cca48a8c754c08168e3f03eba61b"
  integrity sha512-shAmDyaQC4H92APFoIaVDHCx5bStIocgvbwQyxPRrbUY20V1EYTbSDchWbuwlMG3V17cprZhA6+78JfB+3DTPw==

"@sheerun/mutationobserver-shim@^0.3.2":
  version "0.3.3"
  resolved "https://registry.yarnpkg.com/@sheerun/mutationobserver-shim/-/mutationobserver-shim-0.3.3.tgz#5405ee8e444ed212db44e79351f0c70a582aae25"
  integrity sha512-DetpxZw1fzPD5xUBrIAoplLChO2VB8DlL5Gg+I1IR9b2wPqYIca2WSUxL5g1vLeR4MsQq1NeWriXAVffV+U1Fw==

"@svgr/babel-plugin-add-jsx-attribute@^4.2.0":
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-add-jsx-attribute/-/babel-plugin-add-jsx-attribute-4.2.0.tgz#dadcb6218503532d6884b210e7f3c502caaa44b1"
  integrity sha512-j7KnilGyZzYr/jhcrSYS3FGWMZVaqyCG0vzMCwzvei0coIkczuYMcniK07nI0aHJINciujjH11T72ICW5eL5Ig==

"@svgr/babel-plugin-remove-jsx-attribute@^4.2.0":
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-remove-jsx-attribute/-/babel-plugin-remove-jsx-attribute-4.2.0.tgz#297550b9a8c0c7337bea12bdfc8a80bb66f85abc"
  integrity sha512-3XHLtJ+HbRCH4n28S7y/yZoEQnRpl0tvTZQsHqvaeNXPra+6vE5tbRliH3ox1yZYPCxrlqaJT/Mg+75GpDKlvQ==

"@svgr/babel-plugin-remove-jsx-empty-expression@^4.2.0":
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-remove-jsx-empty-expression/-/babel-plugin-remove-jsx-empty-expression-4.2.0.tgz#c196302f3e68eab6a05e98af9ca8570bc13131c7"
  integrity sha512-yTr2iLdf6oEuUE9MsRdvt0NmdpMBAkgK8Bjhl6epb+eQWk6abBaX3d65UZ3E3FWaOwePyUgNyNCMVG61gGCQ7w==

"@svgr/babel-plugin-replace-jsx-attribute-value@^4.2.0":
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-replace-jsx-attribute-value/-/babel-plugin-replace-jsx-attribute-value-4.2.0.tgz#310ec0775de808a6a2e4fd4268c245fd734c1165"
  integrity sha512-U9m870Kqm0ko8beHawRXLGLvSi/ZMrl89gJ5BNcT452fAjtF2p4uRzXkdzvGJJJYBgx7BmqlDjBN/eCp5AAX2w==

"@svgr/babel-plugin-svg-dynamic-title@^4.3.3":
  version "4.3.3"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-svg-dynamic-title/-/babel-plugin-svg-dynamic-title-4.3.3.tgz#2cdedd747e5b1b29ed4c241e46256aac8110dd93"
  integrity sha512-w3Be6xUNdwgParsvxkkeZb545VhXEwjGMwExMVBIdPQJeyMQHqm9Msnb2a1teHBqUYL66qtwfhNkbj1iarCG7w==

"@svgr/babel-plugin-svg-em-dimensions@^4.2.0":
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-svg-em-dimensions/-/babel-plugin-svg-em-dimensions-4.2.0.tgz#9a94791c9a288108d20a9d2cc64cac820f141391"
  integrity sha512-C0Uy+BHolCHGOZ8Dnr1zXy/KgpBOkEUYY9kI/HseHVPeMbluaX3CijJr7D4C5uR8zrc1T64nnq/k63ydQuGt4w==

"@svgr/babel-plugin-transform-react-native-svg@^4.2.0":
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-transform-react-native-svg/-/babel-plugin-transform-react-native-svg-4.2.0.tgz#151487322843359a1ca86b21a3815fd21a88b717"
  integrity sha512-7YvynOpZDpCOUoIVlaaOUU87J4Z6RdD6spYN4eUb5tfPoKGSF9OG2NuhgYnq4jSkAxcpMaXWPf1cePkzmqTPNw==

"@svgr/babel-plugin-transform-svg-component@^4.2.0":
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/@svgr/babel-plugin-transform-svg-component/-/babel-plugin-transform-svg-component-4.2.0.tgz#5f1e2f886b2c85c67e76da42f0f6be1b1767b697"
  integrity sha512-hYfYuZhQPCBVotABsXKSCfel2slf/yvJY8heTVX1PCTaq/IgASq1IyxPPKJ0chWREEKewIU/JMSsIGBtK1KKxw==

"@svgr/babel-preset@^4.3.3":
  version "4.3.3"
  resolved "https://registry.yarnpkg.com/@svgr/babel-preset/-/babel-preset-4.3.3.tgz#a75d8c2f202ac0e5774e6bfc165d028b39a1316c"
  integrity sha512-6PG80tdz4eAlYUN3g5GZiUjg2FMcp+Wn6rtnz5WJG9ITGEF1pmFdzq02597Hn0OmnQuCVaBYQE1OVFAnwOl+0A==
  dependencies:
    "@svgr/babel-plugin-add-jsx-attribute" "^4.2.0"
    "@svgr/babel-plugin-remove-jsx-attribute" "^4.2.0"
    "@svgr/babel-plugin-remove-jsx-empty-expression" "^4.2.0"
    "@svgr/babel-plugin-replace-jsx-attribute-value" "^4.2.0"
    "@svgr/babel-plugin-svg-dynamic-title" "^4.3.3"
    "@svgr/babel-plugin-svg-em-dimensions" "^4.2.0"
    "@svgr/babel-plugin-transform-react-native-svg" "^4.2.0"
    "@svgr/babel-plugin-transform-svg-component" "^4.2.0"

"@svgr/core@^4.3.3":
  version "4.3.3"
  resolved "https://registry.yarnpkg.com/@svgr/core/-/core-4.3.3.tgz#b37b89d5b757dc66e8c74156d00c368338d24293"
  integrity sha512-qNuGF1QON1626UCaZamWt5yedpgOytvLj5BQZe2j1k1B8DUG4OyugZyfEwBeXozCUwhLEpsrgPrE+eCu4fY17w==
  dependencies:
    "@svgr/plugin-jsx" "^4.3.3"
    camelcase "^5.3.1"
    cosmiconfig "^5.2.1"

"@svgr/hast-util-to-babel-ast@^4.3.2":
  version "4.3.2"
  resolved "https://registry.yarnpkg.com/@svgr/hast-util-to-babel-ast/-/hast-util-to-babel-ast-4.3.2.tgz#1d5a082f7b929ef8f1f578950238f630e14532b8"
  integrity sha512-JioXclZGhFIDL3ddn4Kiq8qEqYM2PyDKV0aYno8+IXTLuYt6TOgHUbUAAFvqtb0Xn37NwP0BTHglejFoYr8RZg==
  dependencies:
    "@babel/types" "^7.4.4"

"@svgr/plugin-jsx@^4.3.3":
  version "4.3.3"
  resolved "https://registry.yarnpkg.com/@svgr/plugin-jsx/-/plugin-jsx-4.3.3.tgz#e2ba913dbdfbe85252a34db101abc7ebd50992fa"
  integrity sha512-cLOCSpNWQnDB1/v+SUENHH7a0XY09bfuMKdq9+gYvtuwzC2rU4I0wKGFEp1i24holdQdwodCtDQdFtJiTCWc+w==
  dependencies:
    "@babel/core" "^7.4.5"
    "@svgr/babel-preset" "^4.3.3"
    "@svgr/hast-util-to-babel-ast" "^4.3.2"
    svg-parser "^2.0.0"

"@svgr/plugin-svgo@^4.3.1":
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/@svgr/plugin-svgo/-/plugin-svgo-4.3.1.tgz#daac0a3d872e3f55935c6588dd370336865e9e32"
  integrity sha512-PrMtEDUWjX3Ea65JsVCwTIXuSqa3CG9px+DluF1/eo9mlDrgrtFE7NE/DjdhjJgSM9wenlVBzkzneSIUgfUI/w==
  dependencies:
    cosmiconfig "^5.2.1"
    merge-deep "^3.0.2"
    svgo "^1.2.2"

"@svgr/webpack@4.3.3":
  version "4.3.3"
  resolved "https://registry.yarnpkg.com/@svgr/webpack/-/webpack-4.3.3.tgz#13cc2423bf3dff2d494f16b17eb7eacb86895017"
  integrity sha512-bjnWolZ6KVsHhgyCoYRFmbd26p8XVbulCzSG53BDQqAr+JOAderYK7CuYrB3bDjHJuF6LJ7Wrr42+goLRV9qIg==
  dependencies:
    "@babel/core" "^7.4.5"
    "@babel/plugin-transform-react-constant-elements" "^7.0.0"
    "@babel/preset-env" "^7.4.5"
    "@babel/preset-react" "^7.0.0"
    "@svgr/core" "^4.3.3"
    "@svgr/plugin-jsx" "^4.3.3"
    "@svgr/plugin-svgo" "^4.3.1"
    loader-utils "^1.2.3"

"@testing-library/dom@^6.15.0":
  version "6.16.0"
  resolved "https://registry.yarnpkg.com/@testing-library/dom/-/dom-6.16.0.tgz#04ada27ed74ad4c0f0d984a1245bb29b1fd90ba9"
  integrity sha512-lBD88ssxqEfz0wFL6MeUyyWZfV/2cjEZZV3YRpb2IoJRej/4f1jB0TzqIOznTpfR1r34CNesrubxwIlAQ8zgPA==
  dependencies:
    "@babel/runtime" "^7.8.4"
    "@sheerun/mutationobserver-shim" "^0.3.2"
    "@types/testing-library__dom" "^6.12.1"
    aria-query "^4.0.2"
    dom-accessibility-api "^0.3.0"
    pretty-format "^25.1.0"
    wait-for-expect "^3.0.2"

"@testing-library/jest-dom@^4.2.4":
  version "4.2.4"
  resolved "https://registry.yarnpkg.com/@testing-library/jest-dom/-/jest-dom-4.2.4.tgz#00dfa0cbdd837d9a3c2a7f3f0a248ea6e7b89742"
  integrity sha512-j31Bn0rQo12fhCWOUWy9fl7wtqkp7In/YP2p5ZFyRuiiB9Qs3g+hS4gAmDWONbAHcRmVooNJ5eOHQDCOmUFXHg==
  dependencies:
    "@babel/runtime" "^7.5.1"
    chalk "^2.4.1"
    css "^2.2.3"
    css.escape "^1.5.1"
    jest-diff "^24.0.0"
    jest-matcher-utils "^24.0.0"
    lodash "^4.17.11"
    pretty-format "^24.0.0"
    redent "^3.0.0"

"@testing-library/react@^9.3.2":
  version "9.5.0"
  resolved "https://registry.yarnpkg.com/@testing-library/react/-/react-9.5.0.tgz#71531655a7890b61e77a1b39452fbedf0472ca5e"
  integrity sha512-di1b+D0p+rfeboHO5W7gTVeZDIK5+maEgstrZbWZSSvxDyfDRkkyBE1AJR5Psd6doNldluXlCWqXriUfqu/9Qg==
  dependencies:
    "@babel/runtime" "^7.8.4"
    "@testing-library/dom" "^6.15.0"
    "@types/testing-library__react" "^9.1.2"

"@testing-library/user-event@^7.1.2":
  version "7.2.1"
  resolved "https://registry.yarnpkg.com/@testing-library/user-event/-/user-event-7.2.1.tgz#2ad4e844175a3738cb9e7064be5ea070b8863a1c"
  integrity sha512-oZ0Ib5I4Z2pUEcoo95cT1cr6slco9WY7yiPpG+RGNkj8YcYgJnM7pXmYmorNOReh8MIGcKSqXyeGjxnr8YiZbA==

"@types/babel__core@^7.1.0":
  version "7.1.6"
  resolved "https://registry.yarnpkg.com/@types/babel__core/-/babel__core-7.1.6.tgz#16ff42a5ae203c9af1c6e190ed1f30f83207b610"
  integrity sha512-tTnhWszAqvXnhW7m5jQU9PomXSiKXk2sFxpahXvI20SZKu9ylPi8WtIxueZ6ehDWikPT0jeFujMj3X4ZHuf3Tg==
  dependencies:
    "@babel/parser" "^7.1.0"
    "@babel/types" "^7.0.0"
    "@types/babel__generator" "*"
    "@types/babel__template" "*"
    "@types/babel__traverse" "*"

"@types/babel__generator@*":
  version "7.6.1"
  resolved "https://registry.yarnpkg.com/@types/babel__generator/-/babel__generator-7.6.1.tgz#4901767b397e8711aeb99df8d396d7ba7b7f0e04"
  integrity sha512-bBKm+2VPJcMRVwNhxKu8W+5/zT7pwNEqeokFOmbvVSqGzFneNxYcEBro9Ac7/N9tlsaPYnZLK8J1LWKkMsLAew==
  dependencies:
    "@babel/types" "^7.0.0"

"@types/babel__template@*":
  version "7.0.2"
  resolved "https://registry.yarnpkg.com/@types/babel__template/-/babel__template-7.0.2.tgz#4ff63d6b52eddac1de7b975a5223ed32ecea9307"
  integrity sha512-/K6zCpeW7Imzgab2bLkLEbz0+1JlFSrUMdw7KoIIu+IUdu51GWaBZpd3y1VXGVXzynvGa4DaIaxNZHiON3GXUg==
  dependencies:
    "@babel/parser" "^7.1.0"
    "@babel/types" "^7.0.0"

"@types/babel__traverse@*", "@types/babel__traverse@^7.0.6":
  version "7.0.9"
  resolved "https://registry.yarnpkg.com/@types/babel__traverse/-/babel__traverse-7.0.9.tgz#be82fab304b141c3eee81a4ce3b034d0eba1590a"
  integrity sha512-jEFQ8L1tuvPjOI8lnpaf73oCJe+aoxL6ygqSy6c8LcW98zaC+4mzWuQIRCEvKeCOu+lbqdXcg4Uqmm1S8AP1tw==
  dependencies:
    "@babel/types" "^7.3.0"

"@types/color-name@^1.1.1":
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/@types/color-name/-/color-name-1.1.1.tgz#1c1261bbeaa10a8055bbc5d8ab84b7b2afc846a0"
  integrity sha512-rr+OQyAjxze7GgWrSaJwydHStIhHq2lvY3BOC2Mj7KnzI7XK0Uw1TOOdI9lDoajEbSWLiYgoo4f1R51erQfhPQ==

"@types/eslint-visitor-keys@^1.0.0":
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/@types/eslint-visitor-keys/-/eslint-visitor-keys-1.0.0.tgz#1ee30d79544ca84d68d4b3cdb0af4f205663dd2d"
  integrity sha512-OCutwjDZ4aFS6PB1UZ988C4YgwlBHJd6wCeQqaLdmadZ/7e+w79+hbMUFC1QXDNCmdyoRfAFdm0RypzwR+Qpag==

"@types/events@*":
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/@types/events/-/events-3.0.0.tgz#2862f3f58a9a7f7c3e78d79f130dd4d71c25c2a7"
  integrity sha512-EaObqwIvayI5a8dCzhFrjKzVwKLxjoG9T6Ppd5CEo07LRKfQ8Yokw54r5+Wq7FaBQ+yXRvQAYPrHwya1/UFt9g==

"@types/glob@^7.1.1":
  version "7.1.1"
  resolved "https://registry.yarnpkg.com/@types/glob/-/glob-7.1.1.tgz#aa59a1c6e3fbc421e07ccd31a944c30eba521575"
  integrity sha512-1Bh06cbWJUHMC97acuD6UMG29nMt0Aqz1vF3guLfG+kHHJhy3AyohZFFxYk2f7Q1SQIrNwvncxAE0N/9s70F2w==
  dependencies:
    "@types/events" "*"
    "@types/minimatch" "*"
    "@types/node" "*"

"@types/istanbul-lib-coverage@*", "@types/istanbul-lib-coverage@^2.0.0":
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/@types/istanbul-lib-coverage/-/istanbul-lib-coverage-2.0.1.tgz#42995b446db9a48a11a07ec083499a860e9138ff"
  integrity sha512-hRJD2ahnnpLgsj6KWMYSrmXkM3rm2Dl1qkx6IOFD5FnuNPXJIG5L0dhgKXCYTRMGzU4n0wImQ/xfmRc4POUFlg==

"@types/istanbul-lib-report@*":
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/@types/istanbul-lib-report/-/istanbul-lib-report-3.0.0.tgz#c14c24f18ea8190c118ee7562b7ff99a36552686"
  integrity sha512-plGgXAPfVKFoYfa9NpYDAkseG+g6Jr294RqeqcqDixSbU34MZVJRi/P+7Y8GDpzkEwLaGZZOpKIEmeVZNtKsrg==
  dependencies:
    "@types/istanbul-lib-coverage" "*"

"@types/istanbul-reports@^1.1.1":
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/@types/istanbul-reports/-/istanbul-reports-1.1.1.tgz#7a8cbf6a406f36c8add871625b278eaf0b0d255a"
  integrity sha512-UpYjBi8xefVChsCoBpKShdxTllC9pwISirfoZsUa2AAdQg/Jd2KQGtSbw+ya7GPo7x/wAPlH6JBhKhAsXUEZNA==
  dependencies:
    "@types/istanbul-lib-coverage" "*"
    "@types/istanbul-lib-report" "*"

"@types/json-schema@^7.0.3":
  version "7.0.4"
  resolved "https://registry.yarnpkg.com/@types/json-schema/-/json-schema-7.0.4.tgz#38fd73ddfd9b55abb1e1b2ed578cb55bd7b7d339"
  integrity sha512-8+KAKzEvSUdeo+kmqnKrqgeE+LcA0tjYWFY7RPProVYwnqDjukzO+3b6dLD56rYX5TdWejnEOLJYOIeh4CXKuA==

"@types/minimatch@*":
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/@types/minimatch/-/minimatch-3.0.3.tgz#3dca0e3f33b200fc7d1139c0cd96c1268cadfd9d"
  integrity sha512-tHq6qdbT9U1IRSGf14CL0pUlULksvY9OZ+5eEgl1N7t+OA3tGvNpxJCzuKQlsNgCVwbAs670L1vcVQi8j9HjnA==

"@types/node@*":
  version "13.9.2"
  resolved "https://registry.yarnpkg.com/@types/node/-/node-13.9.2.tgz#ace1880c03594cc3e80206d96847157d8e7fa349"
  integrity sha512-bnoqK579sAYrQbp73wwglccjJ4sfRdKU7WNEZ5FW4K2U6Kc0/eZ5kvXG0JKsEKFB50zrFmfFt52/cvBbZa7eXg==

"@types/parse-json@^4.0.0":
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/@types/parse-json/-/parse-json-4.0.0.tgz#2f8bb441434d163b35fb8ffdccd7138927ffb8c0"
  integrity sha512-//oorEZjL6sbPcKUaCdIGlIUeH26mgzimjBB77G6XRgnDl/L5wOnpyBGRe/Mmf5CVW3PwEBE1NjiMZ/ssFh4wA==

"@types/prop-types@*":
  version "15.7.3"
  resolved "https://registry.yarnpkg.com/@types/prop-types/-/prop-types-15.7.3.tgz#2ab0d5da2e5815f94b0b9d4b95d1e5f243ab2ca7"
  integrity sha512-KfRL3PuHmqQLOG+2tGpRO26Ctg+Cq1E01D2DMriKEATHgWLfeNDmq9e29Q9WIky0dQ3NPkd1mzYH8Lm936Z9qw==

"@types/q@^1.5.1":
  version "1.5.2"
  resolved "https://registry.yarnpkg.com/@types/q/-/q-1.5.2.tgz#690a1475b84f2a884fd07cd797c00f5f31356ea8"
  integrity sha512-ce5d3q03Ex0sy4R14722Rmt6MT07Ua+k4FwDfdcToYJcMKNtRVQvJ6JCAPdAmAnbRb6CsX6aYb9m96NGod9uTw==

"@types/react-dom@*":
  version "16.9.6"
  resolved "https://registry.yarnpkg.com/@types/react-dom/-/react-dom-16.9.6.tgz#9e7f83d90566521cc2083be2277c6712dcaf754c"
  integrity sha512-S6ihtlPMDotrlCJE9ST1fRmYrQNNwfgL61UB4I1W7M6kPulUKx9fXAleW5zpdIjUQ4fTaaog8uERezjsGUj9HQ==
  dependencies:
    "@types/react" "*"

"@types/react@*":
  version "16.9.34"
  resolved "https://registry.yarnpkg.com/@types/react/-/react-16.9.34.tgz#f7d5e331c468f53affed17a8a4d488cd44ea9349"
  integrity sha512-8AJlYMOfPe1KGLKyHpflCg5z46n0b5DbRfqDksxBLBTUpB75ypDBAO9eCUcjNwE6LCUslwTz00yyG/X9gaVtow==
  dependencies:
    "@types/prop-types" "*"
    csstype "^2.2.0"

"@types/stack-utils@^1.0.1":
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/@types/stack-utils/-/stack-utils-1.0.1.tgz#0a851d3bd96498fa25c33ab7278ed3bd65f06c3e"
  integrity sha512-l42BggppR6zLmpfU6fq9HEa2oGPEI8yrSPL3GITjfRInppYFahObbIQOQK3UGxEnyQpltZLaPe75046NOZQikw==

"@types/testing-library__dom@*":
  version "7.0.1"
  resolved "https://registry.yarnpkg.com/@types/testing-library__dom/-/testing-library__dom-7.0.1.tgz#426bef0aa306a603fe071859d4b485941b28aca6"
  integrity sha512-WokGRksRJb3Dla6h02/0/NNHTkjsj4S8aJZiwMj/5/UL8VZ1iCe3H8SHzfpmBeH8Vp4SPRT8iC2o9kYULFhDIw==
  dependencies:
    pretty-format "^25.1.0"

"@types/testing-library__dom@^6.12.1":
  version "6.14.0"
  resolved "https://registry.yarnpkg.com/@types/testing-library__dom/-/testing-library__dom-6.14.0.tgz#1aede831cb4ed4a398448df5a2c54b54a365644e"
  integrity sha512-sMl7OSv0AvMOqn1UJ6j1unPMIHRXen0Ita1ujnMX912rrOcawe4f7wu0Zt9GIQhBhJvH2BaibqFgQ3lP+Pj2hA==
  dependencies:
    pretty-format "^24.3.0"

"@types/testing-library__react@^9.1.2":
  version "9.1.3"
  resolved "https://registry.yarnpkg.com/@types/testing-library__react/-/testing-library__react-9.1.3.tgz#35eca61cc6ea923543796f16034882a1603d7302"
  integrity sha512-iCdNPKU3IsYwRK9JieSYAiX0+aYDXOGAmrC/3/M7AqqSDKnWWVv07X+Zk1uFSL7cMTUYzv4lQRfohucEocn5/w==
  dependencies:
    "@types/react-dom" "*"
    "@types/testing-library__dom" "*"
    pretty-format "^25.1.0"

"@types/yargs-parser@*":
  version "15.0.0"
  resolved "https://registry.yarnpkg.com/@types/yargs-parser/-/yargs-parser-15.0.0.tgz#cb3f9f741869e20cce330ffbeb9271590483882d"
  integrity sha512-FA/BWv8t8ZWJ+gEOnLLd8ygxH/2UFbAvgEonyfN6yWGLKc7zVjbpl2Y4CTjid9h2RfgPP6SEt6uHwEOply00yw==

"@types/yargs@^13.0.0":
  version "13.0.8"
  resolved "https://registry.yarnpkg.com/@types/yargs/-/yargs-13.0.8.tgz#a38c22def2f1c2068f8971acb3ea734eb3c64a99"
  integrity sha512-XAvHLwG7UQ+8M4caKIH0ZozIOYay5fQkAgyIXegXT9jPtdIGdhga+sUEdAr1CiG46aB+c64xQEYyEzlwWVTNzA==
  dependencies:
    "@types/yargs-parser" "*"

"@types/yargs@^15.0.0":
  version "15.0.4"
  resolved "https://registry.yarnpkg.com/@types/yargs/-/yargs-15.0.4.tgz#7e5d0f8ca25e9d5849f2ea443cf7c402decd8299"
  integrity sha512-9T1auFmbPZoxHz0enUFlUuKRy3it01R+hlggyVUMtnCTQRunsQYifnSGb8hET4Xo8yiC0o0r1paW3ud5+rbURg==
  dependencies:
    "@types/yargs-parser" "*"

"@typescript-eslint/eslint-plugin@^2.10.0":
  version "2.24.0"
  resolved "https://registry.yarnpkg.com/@typescript-eslint/eslint-plugin/-/eslint-plugin-2.24.0.tgz#a86cf618c965a462cddf3601f594544b134d6d68"
  integrity sha512-wJRBeaMeT7RLQ27UQkDFOu25MqFOBus8PtOa9KaT5ZuxC1kAsd7JEHqWt4YXuY9eancX0GK9C68i5OROnlIzBA==
  dependencies:
    "@typescript-eslint/experimental-utils" "2.24.0"
    eslint-utils "^1.4.3"
    functional-red-black-tree "^1.0.1"
    regexpp "^3.0.0"
    tsutils "^3.17.1"

"@typescript-eslint/experimental-utils@2.24.0":
  version "2.24.0"
  resolved "https://registry.yarnpkg.com/@typescript-eslint/experimental-utils/-/experimental-utils-2.24.0.tgz#a5cb2ed89fedf8b59638dc83484eb0c8c35e1143"
  integrity sha512-DXrwuXTdVh3ycNCMYmWhUzn/gfqu9N0VzNnahjiDJvcyhfBy4gb59ncVZVxdp5XzBC77dCncu0daQgOkbvPwBw==
  dependencies:
    "@types/json-schema" "^7.0.3"
    "@typescript-eslint/typescript-estree" "2.24.0"
    eslint-scope "^5.0.0"

"@typescript-eslint/parser@^2.10.0":
  version "2.24.0"
  resolved "https://registry.yarnpkg.com/@typescript-eslint/parser/-/parser-2.24.0.tgz#2cf0eae6e6dd44d162486ad949c126b887f11eb8"
  integrity sha512-H2Y7uacwSSg8IbVxdYExSI3T7uM1DzmOn2COGtCahCC3g8YtM1xYAPi2MAHyfPs61VKxP/J/UiSctcRgw4G8aw==
  dependencies:
    "@types/eslint-visitor-keys" "^1.0.0"
    "@typescript-eslint/experimental-utils" "2.24.0"
    "@typescript-eslint/typescript-estree" "2.24.0"
    eslint-visitor-keys "^1.1.0"

"@typescript-eslint/typescript-estree@2.24.0":
  version "2.24.0"
  resolved "https://registry.yarnpkg.com/@typescript-eslint/typescript-estree/-/typescript-estree-2.24.0.tgz#38bbc8bb479790d2f324797ffbcdb346d897c62a"
  integrity sha512-RJ0yMe5owMSix55qX7Mi9V6z2FDuuDpN6eR5fzRJrp+8in9UF41IGNQHbg5aMK4/PjVaEQksLvz0IA8n+Mr/FA==
  dependencies:
    debug "^4.1.1"
    eslint-visitor-keys "^1.1.0"
    glob "^7.1.6"
    is-glob "^4.0.1"
    lodash "^4.17.15"
    semver "^6.3.0"
    tsutils "^3.17.1"

"@webassemblyjs/ast@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/ast/-/ast-1.8.5.tgz#51b1c5fe6576a34953bf4b253df9f0d490d9e359"
  integrity sha512-aJMfngIZ65+t71C3y2nBBg5FFG0Okt9m0XEgWZ7Ywgn1oMAT8cNwx00Uv1cQyHtidq0Xn94R4TAywO+LCQ+ZAQ==
  dependencies:
    "@webassemblyjs/helper-module-context" "1.8.5"
    "@webassemblyjs/helper-wasm-bytecode" "1.8.5"
    "@webassemblyjs/wast-parser" "1.8.5"

"@webassemblyjs/floating-point-hex-parser@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/floating-point-hex-parser/-/floating-point-hex-parser-1.8.5.tgz#1ba926a2923613edce496fd5b02e8ce8a5f49721"
  integrity sha512-9p+79WHru1oqBh9ewP9zW95E3XAo+90oth7S5Re3eQnECGq59ly1Ri5tsIipKGpiStHsUYmY3zMLqtk3gTcOtQ==

"@webassemblyjs/helper-api-error@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/helper-api-error/-/helper-api-error-1.8.5.tgz#c49dad22f645227c5edb610bdb9697f1aab721f7"
  integrity sha512-Za/tnzsvnqdaSPOUXHyKJ2XI7PDX64kWtURyGiJJZKVEdFOsdKUCPTNEVFZq3zJ2R0G5wc2PZ5gvdTRFgm81zA==

"@webassemblyjs/helper-buffer@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/helper-buffer/-/helper-buffer-1.8.5.tgz#fea93e429863dd5e4338555f42292385a653f204"
  integrity sha512-Ri2R8nOS0U6G49Q86goFIPNgjyl6+oE1abW1pS84BuhP1Qcr5JqMwRFT3Ah3ADDDYGEgGs1iyb1DGX+kAi/c/Q==

"@webassemblyjs/helper-code-frame@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/helper-code-frame/-/helper-code-frame-1.8.5.tgz#9a740ff48e3faa3022b1dff54423df9aa293c25e"
  integrity sha512-VQAadSubZIhNpH46IR3yWO4kZZjMxN1opDrzePLdVKAZ+DFjkGD/rf4v1jap744uPVU6yjL/smZbRIIJTOUnKQ==
  dependencies:
    "@webassemblyjs/wast-printer" "1.8.5"

"@webassemblyjs/helper-fsm@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/helper-fsm/-/helper-fsm-1.8.5.tgz#ba0b7d3b3f7e4733da6059c9332275d860702452"
  integrity sha512-kRuX/saORcg8se/ft6Q2UbRpZwP4y7YrWsLXPbbmtepKr22i8Z4O3V5QE9DbZK908dh5Xya4Un57SDIKwB9eow==

"@webassemblyjs/helper-module-context@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/helper-module-context/-/helper-module-context-1.8.5.tgz#def4b9927b0101dc8cbbd8d1edb5b7b9c82eb245"
  integrity sha512-/O1B236mN7UNEU4t9X7Pj38i4VoU8CcMHyy3l2cV/kIF4U5KoHXDVqcDuOs1ltkac90IM4vZdHc52t1x8Yfs3g==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    mamacro "^0.0.3"

"@webassemblyjs/helper-wasm-bytecode@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/helper-wasm-bytecode/-/helper-wasm-bytecode-1.8.5.tgz#537a750eddf5c1e932f3744206551c91c1b93e61"
  integrity sha512-Cu4YMYG3Ddl72CbmpjU/wbP6SACcOPVbHN1dI4VJNJVgFwaKf1ppeFJrwydOG3NDHxVGuCfPlLZNyEdIYlQ6QQ==

"@webassemblyjs/helper-wasm-section@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/helper-wasm-section/-/helper-wasm-section-1.8.5.tgz#74ca6a6bcbe19e50a3b6b462847e69503e6bfcbf"
  integrity sha512-VV083zwR+VTrIWWtgIUpqfvVdK4ff38loRmrdDBgBT8ADXYsEZ5mPQ4Nde90N3UYatHdYoDIFb7oHzMncI02tA==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/helper-buffer" "1.8.5"
    "@webassemblyjs/helper-wasm-bytecode" "1.8.5"
    "@webassemblyjs/wasm-gen" "1.8.5"

"@webassemblyjs/ieee754@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/ieee754/-/ieee754-1.8.5.tgz#712329dbef240f36bf57bd2f7b8fb9bf4154421e"
  integrity sha512-aaCvQYrvKbY/n6wKHb/ylAJr27GglahUO89CcGXMItrOBqRarUMxWLJgxm9PJNuKULwN5n1csT9bYoMeZOGF3g==
  dependencies:
    "@xtuc/ieee754" "^1.2.0"

"@webassemblyjs/leb128@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/leb128/-/leb128-1.8.5.tgz#044edeb34ea679f3e04cd4fd9824d5e35767ae10"
  integrity sha512-plYUuUwleLIziknvlP8VpTgO4kqNaH57Y3JnNa6DLpu/sGcP6hbVdfdX5aHAV716pQBKrfuU26BJK29qY37J7A==
  dependencies:
    "@xtuc/long" "4.2.2"

"@webassemblyjs/utf8@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/utf8/-/utf8-1.8.5.tgz#a8bf3b5d8ffe986c7c1e373ccbdc2a0915f0cedc"
  integrity sha512-U7zgftmQriw37tfD934UNInokz6yTmn29inT2cAetAsaU9YeVCveWEwhKL1Mg4yS7q//NGdzy79nlXh3bT8Kjw==

"@webassemblyjs/wasm-edit@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/wasm-edit/-/wasm-edit-1.8.5.tgz#962da12aa5acc1c131c81c4232991c82ce56e01a"
  integrity sha512-A41EMy8MWw5yvqj7MQzkDjU29K7UJq1VrX2vWLzfpRHt3ISftOXqrtojn7nlPsZ9Ijhp5NwuODuycSvfAO/26Q==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/helper-buffer" "1.8.5"
    "@webassemblyjs/helper-wasm-bytecode" "1.8.5"
    "@webassemblyjs/helper-wasm-section" "1.8.5"
    "@webassemblyjs/wasm-gen" "1.8.5"
    "@webassemblyjs/wasm-opt" "1.8.5"
    "@webassemblyjs/wasm-parser" "1.8.5"
    "@webassemblyjs/wast-printer" "1.8.5"

"@webassemblyjs/wasm-gen@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/wasm-gen/-/wasm-gen-1.8.5.tgz#54840766c2c1002eb64ed1abe720aded714f98bc"
  integrity sha512-BCZBT0LURC0CXDzj5FXSc2FPTsxwp3nWcqXQdOZE4U7h7i8FqtFK5Egia6f9raQLpEKT1VL7zr4r3+QX6zArWg==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/helper-wasm-bytecode" "1.8.5"
    "@webassemblyjs/ieee754" "1.8.5"
    "@webassemblyjs/leb128" "1.8.5"
    "@webassemblyjs/utf8" "1.8.5"

"@webassemblyjs/wasm-opt@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/wasm-opt/-/wasm-opt-1.8.5.tgz#b24d9f6ba50394af1349f510afa8ffcb8a63d264"
  integrity sha512-HKo2mO/Uh9A6ojzu7cjslGaHaUU14LdLbGEKqTR7PBKwT6LdPtLLh9fPY33rmr5wcOMrsWDbbdCHq4hQUdd37Q==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/helper-buffer" "1.8.5"
    "@webassemblyjs/wasm-gen" "1.8.5"
    "@webassemblyjs/wasm-parser" "1.8.5"

"@webassemblyjs/wasm-parser@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/wasm-parser/-/wasm-parser-1.8.5.tgz#21576f0ec88b91427357b8536383668ef7c66b8d"
  integrity sha512-pi0SYE9T6tfcMkthwcgCpL0cM9nRYr6/6fjgDtL6q/ZqKHdMWvxitRi5JcZ7RI4SNJJYnYNaWy5UUrHQy998lw==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/helper-api-error" "1.8.5"
    "@webassemblyjs/helper-wasm-bytecode" "1.8.5"
    "@webassemblyjs/ieee754" "1.8.5"
    "@webassemblyjs/leb128" "1.8.5"
    "@webassemblyjs/utf8" "1.8.5"

"@webassemblyjs/wast-parser@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/wast-parser/-/wast-parser-1.8.5.tgz#e10eecd542d0e7bd394f6827c49f3df6d4eefb8c"
  integrity sha512-daXC1FyKWHF1i11obK086QRlsMsY4+tIOKgBqI1lxAnkp9xe9YMcgOxm9kLe+ttjs5aWV2KKE1TWJCN57/Btsg==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/floating-point-hex-parser" "1.8.5"
    "@webassemblyjs/helper-api-error" "1.8.5"
    "@webassemblyjs/helper-code-frame" "1.8.5"
    "@webassemblyjs/helper-fsm" "1.8.5"
    "@xtuc/long" "4.2.2"

"@webassemblyjs/wast-printer@1.8.5":
  version "1.8.5"
  resolved "https://registry.yarnpkg.com/@webassemblyjs/wast-printer/-/wast-printer-1.8.5.tgz#114bbc481fd10ca0e23b3560fa812748b0bae5bc"
  integrity sha512-w0U0pD4EhlnvRyeJzBqaVSJAo9w/ce7/WPogeXLzGkO6hzhr4GnQIZ4W4uUt5b9ooAaXPtnXlj0gzsXEOUNYMg==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/wast-parser" "1.8.5"
    "@xtuc/long" "4.2.2"

"@xtuc/ieee754@^1.2.0":
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/@xtuc/ieee754/-/ieee754-1.2.0.tgz#eef014a3145ae477a1cbc00cd1e552336dceb790"
  integrity sha512-DX8nKgqcGwsc0eJSqYt5lwP4DH5FlHnmuWWBRy7X0NcaGR0ZtuyeESgMwTYVEtxmsNGY+qit4QYT/MIYTOTPeA==

"@xtuc/long@4.2.2":
  version "4.2.2"
  resolved "https://registry.yarnpkg.com/@xtuc/long/-/long-4.2.2.tgz#d291c6a4e97989b5c61d9acf396ae4fe133a718d"
  integrity sha512-NuHqBY1PB/D8xU6s/thBgOAiAP7HOYDQ32+BFZILJ8ivkUkAHQnWfn6WhL79Owj1qmUnoN/YPhktdIoucipkAQ==

abab@^2.0.0:
  version "2.0.3"
  resolved "https://registry.yarnpkg.com/abab/-/abab-2.0.3.tgz#623e2075e02eb2d3f2475e49f99c91846467907a"
  integrity sha512-tsFzPpcttalNjFBCFMqsKYQcWxxen1pgJR56by//QwvJc4/OUS3kPOOttx2tSIfjsylB0pYu7f5D3K1RCxUnUg==

accepts@~1.3.4, accepts@~1.3.5, accepts@~1.3.7:
  version "1.3.7"
  resolved "https://registry.yarnpkg.com/accepts/-/accepts-1.3.7.tgz#531bc726517a3b2b41f850021c6cc15eaab507cd"
  integrity sha512-Il80Qs2WjYlJIBNzNkK6KYqlVMTbZLXgHx2oT0pU/fjRHyEp+PEfEPY0R3WCwAGVOtauxh1hOxNgIf5bv7dQpA==
  dependencies:
    mime-types "~2.1.24"
    negotiator "0.6.2"

acorn-globals@^4.1.0, acorn-globals@^4.3.0:
  version "4.3.4"
  resolved "https://registry.yarnpkg.com/acorn-globals/-/acorn-globals-4.3.4.tgz#9fa1926addc11c97308c4e66d7add0d40c3272e7"
  integrity sha512-clfQEh21R+D0leSbUdWf3OcfqyaCSAQ8Ryq00bofSekfr9W8u1jyYZo6ir0xu9Gtcf7BjcHJpnbZH7JOCpP60A==
  dependencies:
    acorn "^6.0.1"
    acorn-walk "^6.0.1"

acorn-jsx@^5.2.0:
  version "5.2.0"
  resolved "https://registry.yarnpkg.com/acorn-jsx/-/acorn-jsx-5.2.0.tgz#4c66069173d6fdd68ed85239fc256226182b2ebe"
  integrity sha512-HiUX/+K2YpkpJ+SzBffkM/AQ2YE03S0U1kjTLVpoJdhZMOWy8qvXVN9JdLqv2QsaQ6MPYQIuNmwD8zOiYUofLQ==

acorn-walk@^6.0.1:
  version "6.2.0"
  resolved "https://registry.yarnpkg.com/acorn-walk/-/acorn-walk-6.2.0.tgz#123cb8f3b84c2171f1f7fb252615b1c78a6b1a8c"
  integrity sha512-7evsyfH1cLOCdAzZAd43Cic04yKydNx0cF+7tiA19p1XnLLPU4dpCQOqpjqwokFe//vS0QqfqqjCS2JkiIs0cA==

acorn@^5.5.3:
  version "5.7.4"
  resolved "https://registry.yarnpkg.com/acorn/-/acorn-5.7.4.tgz#3e8d8a9947d0599a1796d10225d7432f4a4acf5e"
  integrity sha512-1D++VG7BhrtvQpNbBzovKNc1FLGGEE/oGe7b9xJm/RFHMBeUaUGpluV9RLjZa47YFdPcDAenEYuq9pQPcMdLJg==

acorn@^6.0.1, acorn@^6.0.4, acorn@^6.2.1:
  version "6.4.1"
  resolved "https://registry.yarnpkg.com/acorn/-/acorn-6.4.1.tgz#531e58ba3f51b9dacb9a6646ca4debf5b14ca474"
  integrity sha512-ZVA9k326Nwrj3Cj9jlh3wGFutC2ZornPNARZwsNYqQYgN0EsV2d53w5RN/co65Ohn4sUAUtb1rSUAOD6XN9idA==

acorn@^7.1.1:
  version "7.1.1"
  resolved "https://registry.yarnpkg.com/acorn/-/acorn-7.1.1.tgz#e35668de0b402f359de515c5482a1ab9f89a69bf"
  integrity sha512-add7dgA5ppRPxCFJoAGfMDi7PIBXq1RtGo7BhbLaxwrXPOmw8gq48Y9ozT01hUKy9byMjlR20EJhu5zlkErEkg==

address@1.1.2, address@^1.0.1:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/address/-/address-1.1.2.tgz#bf1116c9c758c51b7a933d296b72c221ed9428b6"
  integrity sha512-aT6camzM4xEA54YVJYSqxz1kv4IHnQZRtThJJHhUMRExaU5spC7jX5ugSwTaTgJliIgs4VhZOk7htClvQ/LmRA==

adjust-sourcemap-loader@2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/adjust-sourcemap-loader/-/adjust-sourcemap-loader-2.0.0.tgz#6471143af75ec02334b219f54bc7970c52fb29a4"
  integrity sha512-4hFsTsn58+YjrU9qKzML2JSSDqKvN8mUGQ0nNIrfPi8hmIONT4L3uUaT6MKdMsZ9AjsU6D2xDkZxCkbQPxChrA==
  dependencies:
    assert "1.4.1"
    camelcase "5.0.0"
    loader-utils "1.2.3"
    object-path "0.11.4"
    regex-parser "2.2.10"

aggregate-error@^3.0.0:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/aggregate-error/-/aggregate-error-3.0.1.tgz#db2fe7246e536f40d9b5442a39e117d7dd6a24e0"
  integrity sha512-quoaXsZ9/BLNae5yiNoUz+Nhkwz83GhWwtYFglcjEQB2NDHCIpApbqXxIFnm4Pq/Nvhrsq5sYJFyohrrxnTGAA==
  dependencies:
    clean-stack "^2.0.0"
    indent-string "^4.0.0"

ajv-errors@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/ajv-errors/-/ajv-errors-1.0.1.tgz#f35986aceb91afadec4102fbd85014950cefa64d"
  integrity sha512-DCRfO/4nQ+89p/RK43i8Ezd41EqdGIU4ld7nGF8OQ14oc/we5rEntLCUa7+jrn3nn83BosfwZA0wb4pon2o8iQ==

ajv-keywords@^3.1.0, ajv-keywords@^3.4.1:
  version "3.4.1"
  resolved "https://registry.yarnpkg.com/ajv-keywords/-/ajv-keywords-3.4.1.tgz#ef916e271c64ac12171fd8384eaae6b2345854da"
  integrity sha512-RO1ibKvd27e6FEShVFfPALuHI3WjSVNeK5FIsmme/LYRNxjKuNj+Dt7bucLa6NdSv3JcVTyMlm9kGR84z1XpaQ==

ajv@^6.1.0, ajv@^6.10.0, ajv@^6.10.2, ajv@^6.12.0, ajv@^6.5.5:
  version "6.12.0"
  resolved "https://registry.yarnpkg.com/ajv/-/ajv-6.12.0.tgz#06d60b96d87b8454a5adaba86e7854da629db4b7"
  integrity sha512-D6gFiFA0RRLyUbvijN74DWAjXSFxWKaWP7mldxkVhyhAV3+SWA9HEJPHQ2c9soIeTFJqcSdFDGFgdqs1iUU2Hw==
  dependencies:
    fast-deep-equal "^3.1.1"
    fast-json-stable-stringify "^2.0.0"
    json-schema-traverse "^0.4.1"
    uri-js "^4.2.2"

alphanum-sort@^1.0.0:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/alphanum-sort/-/alphanum-sort-1.0.2.tgz#97a1119649b211ad33691d9f9f486a8ec9fbe0a3"
  integrity sha1-l6ERlkmyEa0zaR2fn0hqjsn74KM=

ansi-colors@^3.0.0:
  version "3.2.4"
  resolved "https://registry.yarnpkg.com/ansi-colors/-/ansi-colors-3.2.4.tgz#e3a3da4bfbae6c86a9c285625de124a234026fbf"
  integrity sha512-hHUXGagefjN2iRrID63xckIvotOXOojhQKWIPUZ4mNUZ9nLZW+7FMNoE1lOkEhNWYsx/7ysGIuJYCiMAA9FnrA==

ansi-escapes@^3.0.0:
  version "3.2.0"
  resolved "https://registry.yarnpkg.com/ansi-escapes/-/ansi-escapes-3.2.0.tgz#8780b98ff9dbf5638152d1f1fe5c1d7b4442976b"
  integrity sha512-cBhpre4ma+U0T1oM5fXg7Dy1Jw7zzwv7lt/GoCpr+hDQJoYnKVPLL4dCvSEFMmQurOQvSrwT7SL/DAlhBI97RQ==

ansi-escapes@^4.2.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/ansi-escapes/-/ansi-escapes-4.3.1.tgz#a5c47cc43181f1f38ffd7076837700d395522a61"
  integrity sha512-JWF7ocqNrp8u9oqpgV+wH5ftbt+cfvv+PTjOvKLT3AdYly/LmORARfEVT1iyjwN+4MqE5UmVKoAdIBqeoCHgLA==
  dependencies:
    type-fest "^0.11.0"

ansi-html@0.0.7:
  version "0.0.7"
  resolved "https://registry.yarnpkg.com/ansi-html/-/ansi-html-0.0.7.tgz#813584021962a9e9e6fd039f940d12f56ca7859e"
  integrity sha1-gTWEAhliqenm/QOflA0S9WynhZ4=

ansi-regex@^2.0.0:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-2.1.1.tgz#c3b33ab5ee360d86e0e628f0468ae7ef27d654df"
  integrity sha1-w7M6te42DYbg5ijwRorn7yfWVN8=

ansi-regex@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-3.0.0.tgz#ed0317c322064f79466c02966bddb605ab37d998"
  integrity sha1-7QMXwyIGT3lGbAKWa922Bas32Zg=

ansi-regex@^4.0.0, ansi-regex@^4.1.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-4.1.0.tgz#8b9f8f08cf1acb843756a839ca8c7e3168c51997"
  integrity sha512-1apePfXM1UOSqw0o9IiFAovVz9M5S1Dg+4TrDwfMewQ6p/rmMueb7tWZjQ1rx4Loy1ArBggoqGpfqqdI4rondg==

ansi-regex@^5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/ansi-regex/-/ansi-regex-5.0.0.tgz#388539f55179bf39339c81af30a654d69f87cb75"
  integrity sha512-bY6fj56OUQ0hU1KjFNDQuJFezqKdrAyFdIevADiqrWHwSlbmBNMHp5ak2f40Pm8JTFyM2mqxkG6ngkHO11f/lg==

ansi-styles@^2.2.1:
  version "2.2.1"
  resolved "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-2.2.1.tgz#b432dd3358b634cf75e1e4664368240533c1ddbe"
  integrity sha1-tDLdM1i2NM914eRmQ2gkBTPB3b4=

ansi-styles@^3.2.0, ansi-styles@^3.2.1:
  version "3.2.1"
  resolved "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-3.2.1.tgz#41fbb20243e50b12be0f04b8dedbf07520ce841d"
  integrity sha512-VT0ZI6kZRdTh8YyJw3SMbYm/u+NqfsAxEpWO0Pf9sq8/e94WxxOpPKx9FR1FlyCtOVDNOQ+8ntlqFxiRc+r5qA==
  dependencies:
    color-convert "^1.9.0"

ansi-styles@^4.0.0, ansi-styles@^4.1.0:
  version "4.2.1"
  resolved "https://registry.yarnpkg.com/ansi-styles/-/ansi-styles-4.2.1.tgz#90ae75c424d008d2624c5bf29ead3177ebfcf359"
  integrity sha512-9VGjrMsG1vePxcSweQsN20KY/c4zN0h9fLjqAbwbPfahM3t+NL+M9HC8xeXG2I8pX5NoamTGNuomEUFI7fcUjA==
  dependencies:
    "@types/color-name" "^1.1.1"
    color-convert "^2.0.1"

anymatch@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/anymatch/-/anymatch-2.0.0.tgz#bcb24b4f37934d9aa7ac17b4adaf89e7c76ef2eb"
  integrity sha512-5teOsQWABXHHBFP9y3skS5P3d/WfWXpv3FUpy+LorMrNYaT9pI4oLMQX7jzQ2KklNpGpWHzdCXTDT2Y3XGlZBw==
  dependencies:
    micromatch "^3.1.4"
    normalize-path "^2.1.1"

anymatch@~3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/anymatch/-/anymatch-3.1.1.tgz#c55ecf02185e2469259399310c173ce31233b142"
  integrity sha512-mM8522psRCqzV+6LhomX5wgp25YVibjh8Wj23I5RPkPppSVSjyKD2A2mBJmWGa+KN7f2D6LNh9jkBCeyLktzjg==
  dependencies:
    normalize-path "^3.0.0"
    picomatch "^2.0.4"

aproba@^1.1.1:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/aproba/-/aproba-1.2.0.tgz#6802e6264efd18c790a1b0d517f0f2627bf2c94a"
  integrity sha512-Y9J6ZjXtoYh8RnXVCMOU/ttDmk1aBjunq9vO0ta5x85WDQiQfUF9sIPBITdbiiIVcBo03Hi3jMxigBtsddlXRw==

argparse@^1.0.7:
  version "1.0.10"
  resolved "https://registry.yarnpkg.com/argparse/-/argparse-1.0.10.tgz#bcd6791ea5ae09725e17e5ad988134cd40b3d911"
  integrity sha512-o5Roy6tNG4SL/FOkCAN6RzjiakZS25RLYFrcMttJqbdd8BWrnA+fGz57iN5Pb06pvBGvl5gQ0B48dJlslXvoTg==
  dependencies:
    sprintf-js "~1.0.2"

aria-query@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/aria-query/-/aria-query-3.0.0.tgz#65b3fcc1ca1155a8c9ae64d6eee297f15d5133cc"
  integrity sha1-ZbP8wcoRVajJrmTW7uKX8V1RM8w=
  dependencies:
    ast-types-flow "0.0.7"
    commander "^2.11.0"

aria-query@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/aria-query/-/aria-query-4.0.2.tgz#250687b4ccde1ab86d127da0432ae3552fc7b145"
  integrity sha512-S1G1V790fTaigUSM/Gd0NngzEfiMy9uTUfMyHhKhVyy4cH5O/eTuR01ydhGL0z4Za1PXFTRGH3qL8VhUQuEO5w==
  dependencies:
    "@babel/runtime" "^7.7.4"
    "@babel/runtime-corejs3" "^7.7.4"

arity-n@^1.0.4:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/arity-n/-/arity-n-1.0.4.tgz#d9e76b11733e08569c0847ae7b39b2860b30b745"
  integrity sha1-2edrEXM+CFacCEeuezmyhgswt0U=

arr-diff@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/arr-diff/-/arr-diff-4.0.0.tgz#d6461074febfec71e7e15235761a329a5dc7c520"
  integrity sha1-1kYQdP6/7HHn4VI1dhoyml3HxSA=

arr-flatten@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/arr-flatten/-/arr-flatten-1.1.0.tgz#36048bbff4e7b47e136644316c99669ea5ae91f1"
  integrity sha512-L3hKV5R/p5o81R7O02IGnwpDmkp6E982XhtbuwSe3O4qOtMMMtodicASA1Cny2U+aCXcNpml+m4dPsvsJ3jatg==

arr-union@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/arr-union/-/arr-union-3.1.0.tgz#e39b09aea9def866a8f206e288af63919bae39c4"
  integrity sha1-45sJrqne+Gao8gbiiK9jkZuuOcQ=

array-equal@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/array-equal/-/array-equal-1.0.0.tgz#8c2a5ef2472fd9ea742b04c77a75093ba2757c93"
  integrity sha1-jCpe8kcv2ep0KwTHenUJO6J1fJM=

array-flatten@1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/array-flatten/-/array-flatten-1.1.1.tgz#9a5f699051b1e7073328f2a008968b64ea2955d2"
  integrity sha1-ml9pkFGx5wczKPKgCJaLZOopVdI=

array-flatten@^2.1.0:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/array-flatten/-/array-flatten-2.1.2.tgz#24ef80a28c1a893617e2149b0c6d0d788293b099"
  integrity sha512-hNfzcOV8W4NdualtqBFPyVO+54DSJuZGY9qT4pRroB6S9e3iiido2ISIC5h9R2sPJ8H3FHCIiEnsv1lPXO3KtQ==

array-includes@^3.0.3, array-includes@^3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/array-includes/-/array-includes-3.1.1.tgz#cdd67e6852bdf9c1215460786732255ed2459348"
  integrity sha512-c2VXaCHl7zPsvpkFsw4nxvFie4fh1ur9bpcgsVkIjqn0H/Xwdg+7fv3n2r/isyS8EBj5b06M9kHyZuIr4El6WQ==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0"
    is-string "^1.0.5"

array-union@^1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/array-union/-/array-union-1.0.2.tgz#9a34410e4f4e3da23dea375be5be70f24778ec39"
  integrity sha1-mjRBDk9OPaI96jdb5b5w8kd47Dk=
  dependencies:
    array-uniq "^1.0.1"

array-uniq@^1.0.1:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/array-uniq/-/array-uniq-1.0.3.tgz#af6ac877a25cc7f74e058894753858dfdb24fdb6"
  integrity sha1-r2rId6Jcx/dOBYiUdThY39sk/bY=

array-unique@^0.3.2:
  version "0.3.2"
  resolved "https://registry.yarnpkg.com/array-unique/-/array-unique-0.3.2.tgz#a894b75d4bc4f6cd679ef3244a9fd8f46ae2d428"
  integrity sha1-qJS3XUvE9s1nnvMkSp/Y9Gri1Cg=

array.prototype.flat@^1.2.1:
  version "1.2.3"
  resolved "https://registry.yarnpkg.com/array.prototype.flat/-/array.prototype.flat-1.2.3.tgz#0de82b426b0318dbfdb940089e38b043d37f6c7b"
  integrity sha512-gBlRZV0VSmfPIeWfuuy56XZMvbVfbEUnOXUvt3F/eUUUSyzlgLxhEX4YAEpxNAogRGehPSnfXyPtYyKAhkzQhQ==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0-next.1"

arrify@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/arrify/-/arrify-1.0.1.tgz#898508da2226f380df904728456849c1501a4b0d"
  integrity sha1-iYUI2iIm84DfkEcoRWhJwVAaSw0=

asap@~2.0.6:
  version "2.0.6"
  resolved "https://registry.yarnpkg.com/asap/-/asap-2.0.6.tgz#e50347611d7e690943208bbdafebcbc2fb866d46"
  integrity sha1-5QNHYR1+aQlDIIu9r+vLwvuGbUY=

asn1.js@^4.0.0:
  version "4.10.1"
  resolved "https://registry.yarnpkg.com/asn1.js/-/asn1.js-4.10.1.tgz#b9c2bf5805f1e64aadeed6df3a2bfafb5a73f5a0"
  integrity sha512-p32cOF5q0Zqs9uBiONKYLm6BClCoBCM5O9JfeUSlnQLBTxYdTK+pW+nXflm8UkKd2UYlEbYz5qEi0JuZR9ckSw==
  dependencies:
    bn.js "^4.0.0"
    inherits "^2.0.1"
    minimalistic-assert "^1.0.0"

asn1@~0.2.3:
  version "0.2.4"
  resolved "https://registry.yarnpkg.com/asn1/-/asn1-0.2.4.tgz#8d2475dfab553bb33e77b54e59e880bb8ce23136"
  integrity sha512-jxwzQpLQjSmWXgwaCZE9Nz+glAG01yF1QnWgbhGwHI5A6FRIEY6IVqtHhIepHqI7/kyEyQEagBC5mBEFlIYvdg==
  dependencies:
    safer-buffer "~2.1.0"

assert-plus@1.0.0, assert-plus@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/assert-plus/-/assert-plus-1.0.0.tgz#f12e0f3c5d77b0b1cdd9146942e4e96c1e4dd525"
  integrity sha1-8S4PPF13sLHN2RRpQuTpbB5N1SU=

assert@1.4.1:
  version "1.4.1"
  resolved "https://registry.yarnpkg.com/assert/-/assert-1.4.1.tgz#99912d591836b5a6f5b345c0f07eefc08fc65d91"
  integrity sha1-mZEtWRg2tab1s0XA8H7vwI/GXZE=
  dependencies:
    util "0.10.3"

assert@^1.1.1:
  version "1.5.0"
  resolved "https://registry.yarnpkg.com/assert/-/assert-1.5.0.tgz#55c109aaf6e0aefdb3dc4b71240c70bf574b18eb"
  integrity sha512-EDsgawzwoun2CZkCgtxJbv392v4nbk9XDD06zI+kQYoBM/3RBWLlEyJARDOmhAAosBjWACEkKL6S+lIZtcAubA==
  dependencies:
    object-assign "^4.1.1"
    util "0.10.3"

assign-symbols@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/assign-symbols/-/assign-symbols-1.0.0.tgz#59667f41fadd4f20ccbc2bb96b8d4f7f78ec0367"
  integrity sha1-WWZ/QfrdTyDMvCu5a41Pf3jsA2c=

ast-types-flow@0.0.7, ast-types-flow@^0.0.7:
  version "0.0.7"
  resolved "https://registry.yarnpkg.com/ast-types-flow/-/ast-types-flow-0.0.7.tgz#f70b735c6bca1a5c9c22d982c3e39e7feba3bdad"
  integrity sha1-9wtzXGvKGlycItmCw+Oef+ujva0=

astral-regex@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/astral-regex/-/astral-regex-1.0.0.tgz#6c8c3fb827dd43ee3918f27b82782ab7658a6fd9"
  integrity sha512-+Ryf6g3BKoRc7jfp7ad8tM4TtMiaWvbF/1/sQcZPkkS7ag3D5nMBCe2UfOTONtAkaG0tO0ij3C5Lwmf1EiyjHg==

async-each@^1.0.1:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/async-each/-/async-each-1.0.3.tgz#b727dbf87d7651602f06f4d4ac387f47d91b0cbf"
  integrity sha512-z/WhQ5FPySLdvREByI2vZiTWwCnF0moMJ1hK9YQwDTHKh6I7/uSckMetoRGb5UBZPC1z0jlw+n/XCgjeH7y1AQ==

async-limiter@~1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/async-limiter/-/async-limiter-1.0.1.tgz#dd379e94f0db8310b08291f9d64c3209766617fd"
  integrity sha512-csOlWGAcRFJaI6m+F2WKdnMKr4HhdhFVBk0H/QbJFMCr+uO2kwohwXQPxw/9OCxp05r5ghVBFSyioixx3gfkNQ==

async@^2.6.2:
  version "2.6.3"
  resolved "https://registry.yarnpkg.com/async/-/async-2.6.3.tgz#d72625e2344a3656e3a3ad4fa749fa83299d82ff"
  integrity sha512-zflvls11DCy+dQWzTW2dzuilv8Z5X/pjfmZOWba6TNIVDm+2UDaJmXSOXlasHKfNBs8oo3M0aT50fDEWfKZjXg==
  dependencies:
    lodash "^4.17.14"

asynckit@^0.4.0:
  version "0.4.0"
  resolved "https://registry.yarnpkg.com/asynckit/-/asynckit-0.4.0.tgz#c79ed97f7f34cb8f2ba1bc9790bcc366474b4b79"
  integrity sha1-x57Zf380y48robyXkLzDZkdLS3k=

atob@^2.1.2:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/atob/-/atob-2.1.2.tgz#6d9517eb9e030d2436666651e86bd9f6f13533c9"
  integrity sha512-Wm6ukoaOGJi/73p/cl2GvLjTI5JM1k/O14isD73YML8StrH/7/lRFgmg8nICZgD3bZZvjwCGxtMOD3wWNAu8cg==

autoprefixer@^9.6.1:
  version "9.7.4"
  resolved "https://registry.yarnpkg.com/autoprefixer/-/autoprefixer-9.7.4.tgz#f8bf3e06707d047f0641d87aee8cfb174b2a5378"
  integrity sha512-g0Ya30YrMBAEZk60lp+qfX5YQllG+S5W3GYCFvyHTvhOki0AEQJLPEcIuGRsqVwLi8FvXPVtwTGhfr38hVpm0g==
  dependencies:
    browserslist "^4.8.3"
    caniuse-lite "^1.0.30001020"
    chalk "^2.4.2"
    normalize-range "^0.1.2"
    num2fraction "^1.2.2"
    postcss "^7.0.26"
    postcss-value-parser "^4.0.2"

aws-sign2@~0.7.0:
  version "0.7.0"
  resolved "https://registry.yarnpkg.com/aws-sign2/-/aws-sign2-0.7.0.tgz#b46e890934a9591f2d2f6f86d7e6a9f1b3fe76a8"
  integrity sha1-tG6JCTSpWR8tL2+G1+ap8bP+dqg=

aws4@^1.8.0:
  version "1.9.1"
  resolved "https://registry.yarnpkg.com/aws4/-/aws4-1.9.1.tgz#7e33d8f7d449b3f673cd72deb9abdc552dbe528e"
  integrity sha512-wMHVg2EOHaMRxbzgFJ9gtjOOCrI80OHLG14rxi28XwOW8ux6IiEbRCGGGqCtdAIg4FQCbW20k9RsT4y3gJlFug==

axobject-query@^2.0.2:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/axobject-query/-/axobject-query-2.1.2.tgz#2bdffc0371e643e5f03ba99065d5179b9ca79799"
  integrity sha512-ICt34ZmrVt8UQnvPl6TVyDTkmhXmAyAT4Jh5ugfGUX4MOrZ+U/ZY6/sdylRw3qGNr9Ub5AJsaHeDMzNLehRdOQ==

babel-code-frame@^6.22.0:
  version "6.26.0"
  resolved "https://registry.yarnpkg.com/babel-code-frame/-/babel-code-frame-6.26.0.tgz#63fd43f7dc1e3bb7ce35947db8fe369a3f58c74b"
  integrity sha1-Y/1D99weO7fONZR9uP42mj9Yx0s=
  dependencies:
    chalk "^1.1.3"
    esutils "^2.0.2"
    js-tokens "^3.0.2"

babel-eslint@10.1.0:
  version "10.1.0"
  resolved "https://registry.yarnpkg.com/babel-eslint/-/babel-eslint-10.1.0.tgz#6968e568a910b78fb3779cdd8b6ac2f479943232"
  integrity sha512-ifWaTHQ0ce+448CYop8AdrQiBsGrnC+bMgfyKFdi6EsPLTAWG+QfyDeM6OH+FmWnKvEq5NnBMLvlBUPKQZoDSg==
  dependencies:
    "@babel/code-frame" "^7.0.0"
    "@babel/parser" "^7.7.0"
    "@babel/traverse" "^7.7.0"
    "@babel/types" "^7.7.0"
    eslint-visitor-keys "^1.0.0"
    resolve "^1.12.0"

babel-extract-comments@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/babel-extract-comments/-/babel-extract-comments-1.0.0.tgz#0a2aedf81417ed391b85e18b4614e693a0351a21"
  integrity sha512-qWWzi4TlddohA91bFwgt6zO/J0X+io7Qp184Fw0m2JYRSTZnJbFR8+07KmzudHCZgOiKRCrjhylwv9Xd8gfhVQ==
  dependencies:
    babylon "^6.18.0"

babel-jest@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/babel-jest/-/babel-jest-24.9.0.tgz#3fc327cb8467b89d14d7bc70e315104a783ccd54"
  integrity sha512-ntuddfyiN+EhMw58PTNL1ph4C9rECiQXjI4nMMBKBaNjXvqLdkXpPRcMSr4iyBrJg/+wz9brFUD6RhOAT6r4Iw==
  dependencies:
    "@jest/transform" "^24.9.0"
    "@jest/types" "^24.9.0"
    "@types/babel__core" "^7.1.0"
    babel-plugin-istanbul "^5.1.0"
    babel-preset-jest "^24.9.0"
    chalk "^2.4.2"
    slash "^2.0.0"

babel-loader@8.1.0:
  version "8.1.0"
  resolved "https://registry.yarnpkg.com/babel-loader/-/babel-loader-8.1.0.tgz#c611d5112bd5209abe8b9fa84c3e4da25275f1c3"
  integrity sha512-7q7nC1tYOrqvUrN3LQK4GwSk/TQorZSOlO9C+RZDZpODgyN4ZlCqE5q9cDsyWOliN+aU9B4JX01xK9eJXowJLw==
  dependencies:
    find-cache-dir "^2.1.0"
    loader-utils "^1.4.0"
    mkdirp "^0.5.3"
    pify "^4.0.1"
    schema-utils "^2.6.5"

babel-plugin-dynamic-import-node@^2.3.0:
  version "2.3.0"
  resolved "https://registry.yarnpkg.com/babel-plugin-dynamic-import-node/-/babel-plugin-dynamic-import-node-2.3.0.tgz#f00f507bdaa3c3e3ff6e7e5e98d90a7acab96f7f"
  integrity sha512-o6qFkpeQEBxcqt0XYlWzAVxNCSCZdUgcR8IRlhD/8DylxjjO4foPcvTW0GGKa/cVt3rvxZ7o5ippJ+/0nvLhlQ==
  dependencies:
    object.assign "^4.1.0"

babel-plugin-istanbul@^5.1.0:
  version "5.2.0"
  resolved "https://registry.yarnpkg.com/babel-plugin-istanbul/-/babel-plugin-istanbul-5.2.0.tgz#df4ade83d897a92df069c4d9a25cf2671293c854"
  integrity sha512-5LphC0USA8t4i1zCtjbbNb6jJj/9+X6P37Qfirc/70EQ34xKlMW+a1RHGwxGI+SwWpNwZ27HqvzAobeqaXwiZw==
  dependencies:
    "@babel/helper-plugin-utils" "^7.0.0"
    find-up "^3.0.0"
    istanbul-lib-instrument "^3.3.0"
    test-exclude "^5.2.3"

babel-plugin-jest-hoist@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/babel-plugin-jest-hoist/-/babel-plugin-jest-hoist-24.9.0.tgz#4f837091eb407e01447c8843cbec546d0002d756"
  integrity sha512-2EMA2P8Vp7lG0RAzr4HXqtYwacfMErOuv1U3wrvxHX6rD1sV6xS3WXG3r8TRQ2r6w8OhvSdWt+z41hQNwNm3Xw==
  dependencies:
    "@types/babel__traverse" "^7.0.6"

babel-plugin-macros@2.8.0:
  version "2.8.0"
  resolved "https://registry.yarnpkg.com/babel-plugin-macros/-/babel-plugin-macros-2.8.0.tgz#0f958a7cc6556b1e65344465d99111a1e5e10138"
  integrity sha512-SEP5kJpfGYqYKpBrj5XU3ahw5p5GOHJ0U5ssOSQ/WBVdwkD2Dzlce95exQTs3jOVWPPKLBN2rlEWkCK7dSmLvg==
  dependencies:
    "@babel/runtime" "^7.7.2"
    cosmiconfig "^6.0.0"
    resolve "^1.12.0"

babel-plugin-named-asset-import@^0.3.6:
  version "0.3.6"
  resolved "https://registry.yarnpkg.com/babel-plugin-named-asset-import/-/babel-plugin-named-asset-import-0.3.6.tgz#c9750a1b38d85112c9e166bf3ef7c5dbc605f4be"
  integrity sha512-1aGDUfL1qOOIoqk9QKGIo2lANk+C7ko/fqH0uIyC71x3PEGz0uVP8ISgfEsFuG+FKmjHTvFK/nNM8dowpmUxLA==

babel-plugin-syntax-object-rest-spread@^6.8.0:
  version "6.13.0"
  resolved "https://registry.yarnpkg.com/babel-plugin-syntax-object-rest-spread/-/babel-plugin-syntax-object-rest-spread-6.13.0.tgz#fd6536f2bce13836ffa3a5458c4903a597bb3bf5"
  integrity sha1-/WU28rzhODb/o6VFjEkDpZe7O/U=

babel-plugin-transform-object-rest-spread@^6.26.0:
  version "6.26.0"
  resolved "https://registry.yarnpkg.com/babel-plugin-transform-object-rest-spread/-/babel-plugin-transform-object-rest-spread-6.26.0.tgz#0f36692d50fef6b7e2d4b3ac1478137a963b7b06"
  integrity sha1-DzZpLVD+9rfi1LOsFHgTepY7ewY=
  dependencies:
    babel-plugin-syntax-object-rest-spread "^6.8.0"
    babel-runtime "^6.26.0"

babel-plugin-transform-react-remove-prop-types@0.4.24:
  version "0.4.24"
  resolved "https://registry.yarnpkg.com/babel-plugin-transform-react-remove-prop-types/-/babel-plugin-transform-react-remove-prop-types-0.4.24.tgz#f2edaf9b4c6a5fbe5c1d678bfb531078c1555f3a"
  integrity sha512-eqj0hVcJUR57/Ug2zE1Yswsw4LhuqqHhD+8v120T1cl3kjg76QwtyBrdIk4WVwK+lAhBJVYCd/v+4nc4y+8JsA==

babel-preset-jest@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/babel-preset-jest/-/babel-preset-jest-24.9.0.tgz#192b521e2217fb1d1f67cf73f70c336650ad3cdc"
  integrity sha512-izTUuhE4TMfTRPF92fFwD2QfdXaZW08qvWTFCI51V8rW5x00UuPgc3ajRoWofXOuxjfcOM5zzSYsQS3H8KGCAg==
  dependencies:
    "@babel/plugin-syntax-object-rest-spread" "^7.0.0"
    babel-plugin-jest-hoist "^24.9.0"

babel-preset-react-app@^9.1.2:
  version "9.1.2"
  resolved "https://registry.yarnpkg.com/babel-preset-react-app/-/babel-preset-react-app-9.1.2.tgz#54775d976588a8a6d1a99201a702befecaf48030"
  integrity sha512-k58RtQOKH21NyKtzptoAvtAODuAJJs3ZhqBMl456/GnXEQ/0La92pNmwgWoMn5pBTrsvk3YYXdY7zpY4e3UIxA==
  dependencies:
    "@babel/core" "7.9.0"
    "@babel/plugin-proposal-class-properties" "7.8.3"
    "@babel/plugin-proposal-decorators" "7.8.3"
    "@babel/plugin-proposal-nullish-coalescing-operator" "7.8.3"
    "@babel/plugin-proposal-numeric-separator" "7.8.3"
    "@babel/plugin-proposal-optional-chaining" "7.9.0"
    "@babel/plugin-transform-flow-strip-types" "7.9.0"
    "@babel/plugin-transform-react-display-name" "7.8.3"
    "@babel/plugin-transform-runtime" "7.9.0"
    "@babel/preset-env" "7.9.0"
    "@babel/preset-react" "7.9.1"
    "@babel/preset-typescript" "7.9.0"
    "@babel/runtime" "7.9.0"
    babel-plugin-macros "2.8.0"
    babel-plugin-transform-react-remove-prop-types "0.4.24"

babel-runtime@^6.26.0:
  version "6.26.0"
  resolved "https://registry.yarnpkg.com/babel-runtime/-/babel-runtime-6.26.0.tgz#965c7058668e82b55d7bfe04ff2337bc8b5647fe"
  integrity sha1-llxwWGaOgrVde/4E/yM3vItWR/4=
  dependencies:
    core-js "^2.4.0"
    regenerator-runtime "^0.11.0"

babylon@^6.18.0:
  version "6.18.0"
  resolved "https://registry.yarnpkg.com/babylon/-/babylon-6.18.0.tgz#af2f3b88fa6f5c1e4c634d1a0f8eac4f55b395e3"
  integrity sha512-q/UEjfGJ2Cm3oKV71DJz9d25TPnq5rhBVL2Q4fA5wcC3jcrdn7+SssEybFIxwAvvP+YCsCYNKughoF33GxgycQ==

balanced-match@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/balanced-match/-/balanced-match-1.0.0.tgz#89b4d199ab2bee49de164ea02b89ce462d71b767"
  integrity sha1-ibTRmasr7kneFk6gK4nORi1xt2c=

base64-js@^1.0.2:
  version "1.3.1"
  resolved "https://registry.yarnpkg.com/base64-js/-/base64-js-1.3.1.tgz#58ece8cb75dd07e71ed08c736abc5fac4dbf8df1"
  integrity sha512-mLQ4i2QO1ytvGWFWmcngKO//JXAQueZvwEKtjgQFM4jIK0kU+ytMfplL8j+n5mspOfjHwoAg+9yhb7BwAHm36g==

base@^0.11.1:
  version "0.11.2"
  resolved "https://registry.yarnpkg.com/base/-/base-0.11.2.tgz#7bde5ced145b6d551a90db87f83c558b4eb48a8f"
  integrity sha512-5T6P4xPgpp0YDFvSWwEZ4NoE3aM4QBQXDzmVbraCkFj8zHM+mba8SyqB5DbZWyR7mYHo6Y7BdQo3MoA4m0TeQg==
  dependencies:
    cache-base "^1.0.1"
    class-utils "^0.3.5"
    component-emitter "^1.2.1"
    define-property "^1.0.0"
    isobject "^3.0.1"
    mixin-deep "^1.2.0"
    pascalcase "^0.1.1"

batch@0.6.1:
  version "0.6.1"
  resolved "https://registry.yarnpkg.com/batch/-/batch-0.6.1.tgz#dc34314f4e679318093fc760272525f94bf25c16"
  integrity sha1-3DQxT05nkxgJP8dgJyUl+UvyXBY=

bcrypt-pbkdf@^1.0.0:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/bcrypt-pbkdf/-/bcrypt-pbkdf-1.0.2.tgz#a4301d389b6a43f9b67ff3ca11a3f6637e360e9e"
  integrity sha1-pDAdOJtqQ/m2f/PKEaP2Y342Dp4=
  dependencies:
    tweetnacl "^0.14.3"

big.js@^5.2.2:
  version "5.2.2"
  resolved "https://registry.yarnpkg.com/big.js/-/big.js-5.2.2.tgz#65f0af382f578bcdc742bd9c281e9cb2d7768328"
  integrity sha512-vyL2OymJxmarO8gxMr0mhChsO9QGwhynfuu4+MHTAW6czfq9humCB7rKpUjDd9YUiDPU4mzpyupFSvOClAwbmQ==

binary-extensions@^1.0.0:
  version "1.13.1"
  resolved "https://registry.yarnpkg.com/binary-extensions/-/binary-extensions-1.13.1.tgz#598afe54755b2868a5330d2aff9d4ebb53209b65"
  integrity sha512-Un7MIEDdUC5gNpcGDV97op1Ywk748MpHcFTHoYs6qnj1Z3j7I53VG3nwZhKzoBZmbdRNnb6WRdFlwl7tSDuZGw==

binary-extensions@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/binary-extensions/-/binary-extensions-2.0.0.tgz#23c0df14f6a88077f5f986c0d167ec03c3d5537c"
  integrity sha512-Phlt0plgpIIBOGTT/ehfFnbNlfsDEiqmzE2KRXoX1bLIlir4X/MR+zSyBEkL05ffWgnRSf/DXv+WrUAVr93/ow==

bindings@^1.5.0:
  version "1.5.0"
  resolved "https://registry.yarnpkg.com/bindings/-/bindings-1.5.0.tgz#10353c9e945334bc0511a6d90b38fbc7c9c504df"
  integrity sha512-p2q/t/mhvuOj/UeLlV6566GD/guowlr0hHxClI0W9m7MWYkL1F0hLo+0Aexs9HSPCtR1SXQ0TD3MMKrXZajbiQ==
  dependencies:
    file-uri-to-path "1.0.0"

bluebird@^3.5.5:
  version "3.7.2"
  resolved "https://registry.yarnpkg.com/bluebird/-/bluebird-3.7.2.tgz#9f229c15be272454ffa973ace0dbee79a1b0c36f"
  integrity sha512-XpNj6GDQzdfW+r2Wnn7xiSAd7TM3jzkxGXBGTtWKuSXv1xUV+azxAm8jdWZN06QTQk+2N2XB9jRDkvbmQmcRtg==

bn.js@^4.0.0, bn.js@^4.1.0, bn.js@^4.1.1, bn.js@^4.4.0:
  version "4.11.8"
  resolved "https://registry.yarnpkg.com/bn.js/-/bn.js-4.11.8.tgz#2cde09eb5ee341f484746bb0309b3253b1b1442f"
  integrity sha512-ItfYfPLkWHUjckQCk8xC+LwxgK8NYcXywGigJgSwOP8Y2iyWT4f2vsZnoOXTTbo+o5yXmIUJ4gn5538SO5S3gA==

body-parser@1.19.0:
  version "1.19.0"
  resolved "https://registry.yarnpkg.com/body-parser/-/body-parser-1.19.0.tgz#96b2709e57c9c4e09a6fd66a8fd979844f69f08a"
  integrity sha512-dhEPs72UPbDnAQJ9ZKMNTP6ptJaionhP5cBb541nXPlW60Jepo9RV/a4fX4XWW9CuFNK22krhrj1+rgzifNCsw==
  dependencies:
    bytes "3.1.0"
    content-type "~1.0.4"
    debug "2.6.9"
    depd "~1.1.2"
    http-errors "1.7.2"
    iconv-lite "0.4.24"
    on-finished "~2.3.0"
    qs "6.7.0"
    raw-body "2.4.0"
    type-is "~1.6.17"

bonjour@^3.5.0:
  version "3.5.0"
  resolved "https://registry.yarnpkg.com/bonjour/-/bonjour-3.5.0.tgz#8e890a183d8ee9a2393b3844c691a42bcf7bc9f5"
  integrity sha1-jokKGD2O6aI5OzhExpGkK897yfU=
  dependencies:
    array-flatten "^2.1.0"
    deep-equal "^1.0.1"
    dns-equal "^1.0.0"
    dns-txt "^2.0.2"
    multicast-dns "^6.0.1"
    multicast-dns-service-types "^1.1.0"

boolbase@^1.0.0, boolbase@~1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/boolbase/-/boolbase-1.0.0.tgz#68dff5fbe60c51eb37725ea9e3ed310dcc1e776e"
  integrity sha1-aN/1++YMUes3cl6p4+0xDcwed24=

brace-expansion@^1.1.7:
  version "1.1.11"
  resolved "https://registry.yarnpkg.com/brace-expansion/-/brace-expansion-1.1.11.tgz#3c7fcbf529d87226f3d2f52b966ff5271eb441dd"
  integrity sha512-iCuPHDFgrHX7H2vEI/5xpz07zSHB00TpugqhmYtVmMO6518mCuRMoOYFldEBl0g187ufozdaHgWKcYFb61qGiA==
  dependencies:
    balanced-match "^1.0.0"
    concat-map "0.0.1"

braces@^2.3.1, braces@^2.3.2:
  version "2.3.2"
  resolved "https://registry.yarnpkg.com/braces/-/braces-2.3.2.tgz#5979fd3f14cd531565e5fa2df1abfff1dfaee729"
  integrity sha512-aNdbnj9P8PjdXU4ybaWLK2IF3jc/EoDYbC7AazW6to3TRsfXxscC9UXOB5iDiEQrkyIbWp2SLQda4+QAa7nc3w==
  dependencies:
    arr-flatten "^1.1.0"
    array-unique "^0.3.2"
    extend-shallow "^2.0.1"
    fill-range "^4.0.0"
    isobject "^3.0.1"
    repeat-element "^1.1.2"
    snapdragon "^0.8.1"
    snapdragon-node "^2.0.1"
    split-string "^3.0.2"
    to-regex "^3.0.1"

braces@~3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/braces/-/braces-3.0.2.tgz#3454e1a462ee8d599e236df336cd9ea4f8afe107"
  integrity sha512-b8um+L1RzM3WDSzvhm6gIz1yfTbBt6YTlcEKAvsmqCZZFw46z626lVj9j1yEPW33H5H+lBQpZMP1k8l+78Ha0A==
  dependencies:
    fill-range "^7.0.1"

brorand@^1.0.1:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/brorand/-/brorand-1.1.0.tgz#12c25efe40a45e3c323eb8675a0a0ce57b22371f"
  integrity sha1-EsJe/kCkXjwyPrhnWgoM5XsiNx8=

browser-process-hrtime@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/browser-process-hrtime/-/browser-process-hrtime-1.0.0.tgz#3c9b4b7d782c8121e56f10106d84c0d0ffc94626"
  integrity sha512-9o5UecI3GhkpM6DrXr69PblIuWxPKk9Y0jHBRhdocZ2y7YECBFCsHm79Pr3OyR2AvjhDkabFJaDJMYRazHgsow==

browser-resolve@^1.11.3:
  version "1.11.3"
  resolved "https://registry.yarnpkg.com/browser-resolve/-/browser-resolve-1.11.3.tgz#9b7cbb3d0f510e4cb86bdbd796124d28b5890af6"
  integrity sha512-exDi1BYWB/6raKHmDTCicQfTkqwN5fioMFV4j8BsfMU4R2DK/QfZfK7kOVkmWCNANf0snkBzqGqAJBao9gZMdQ==
  dependencies:
    resolve "1.1.7"

browserify-aes@^1.0.0, browserify-aes@^1.0.4:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/browserify-aes/-/browserify-aes-1.2.0.tgz#326734642f403dabc3003209853bb70ad428ef48"
  integrity sha512-+7CHXqGuspUn/Sl5aO7Ea0xWGAtETPXNSAjHo48JfLdPWcMng33Xe4znFvQweqc/uzk5zSOI3H52CYnjCfb5hA==
  dependencies:
    buffer-xor "^1.0.3"
    cipher-base "^1.0.0"
    create-hash "^1.1.0"
    evp_bytestokey "^1.0.3"
    inherits "^2.0.1"
    safe-buffer "^5.0.1"

browserify-cipher@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/browserify-cipher/-/browserify-cipher-1.0.1.tgz#8d6474c1b870bfdabcd3bcfcc1934a10e94f15f0"
  integrity sha512-sPhkz0ARKbf4rRQt2hTpAHqn47X3llLkUGn+xEJzLjwY8LRs2p0v7ljvI5EyoRO/mexrNunNECisZs+gw2zz1w==
  dependencies:
    browserify-aes "^1.0.4"
    browserify-des "^1.0.0"
    evp_bytestokey "^1.0.0"

browserify-des@^1.0.0:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/browserify-des/-/browserify-des-1.0.2.tgz#3af4f1f59839403572f1c66204375f7a7f703e9c"
  integrity sha512-BioO1xf3hFwz4kc6iBhI3ieDFompMhrMlnDFC4/0/vd5MokpuAc3R+LYbwTA9A5Yc9pq9UYPqffKpW2ObuwX5A==
  dependencies:
    cipher-base "^1.0.1"
    des.js "^1.0.0"
    inherits "^2.0.1"
    safe-buffer "^5.1.2"

browserify-rsa@^4.0.0:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/browserify-rsa/-/browserify-rsa-4.0.1.tgz#21e0abfaf6f2029cf2fafb133567a701d4135524"
  integrity sha1-IeCr+vbyApzy+vsTNWenAdQTVSQ=
  dependencies:
    bn.js "^4.1.0"
    randombytes "^2.0.1"

browserify-sign@^4.0.0:
  version "4.0.4"
  resolved "https://registry.yarnpkg.com/browserify-sign/-/browserify-sign-4.0.4.tgz#aa4eb68e5d7b658baa6bf6a57e630cbd7a93d298"
  integrity sha1-qk62jl17ZYuqa/alfmMMvXqT0pg=
  dependencies:
    bn.js "^4.1.1"
    browserify-rsa "^4.0.0"
    create-hash "^1.1.0"
    create-hmac "^1.1.2"
    elliptic "^6.0.0"
    inherits "^2.0.1"
    parse-asn1 "^5.0.0"

browserify-zlib@^0.2.0:
  version "0.2.0"
  resolved "https://registry.yarnpkg.com/browserify-zlib/-/browserify-zlib-0.2.0.tgz#2869459d9aa3be245fe8fe2ca1f46e2e7f54d73f"
  integrity sha512-Z942RysHXmJrhqk88FmKBVq/v5tqmSkDz7p54G/MGyjMnCFFnC79XWNbg+Vta8W6Wb2qtSZTSxIGkJrRpCFEiA==
  dependencies:
    pako "~1.0.5"

browserslist@4.10.0, browserslist@^4.0.0, browserslist@^4.6.2, browserslist@^4.6.4, browserslist@^4.8.3, browserslist@^4.9.1:
  version "4.10.0"
  resolved "https://registry.yarnpkg.com/browserslist/-/browserslist-4.10.0.tgz#f179737913eaf0d2b98e4926ac1ca6a15cbcc6a9"
  integrity sha512-TpfK0TDgv71dzuTsEAlQiHeWQ/tiPqgNZVdv046fvNtBZrjbv2O3TsWCDU0AWGJJKCF/KsjNdLzR9hXOsh/CfA==
  dependencies:
    caniuse-lite "^1.0.30001035"
    electron-to-chromium "^1.3.378"
    node-releases "^1.1.52"
    pkg-up "^3.1.0"

bser@2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/bser/-/bser-2.1.1.tgz#e6787da20ece9d07998533cfd9de6f5c38f4bc05"
  integrity sha512-gQxTNE/GAfIIrmHLUE3oJyp5FO6HRBfhjnw4/wMmA63ZGDJnWBmgY/lyQBpnDUkGmAhbSe39tx2d/iTOAfglwQ==
  dependencies:
    node-int64 "^0.4.0"

buffer-from@^1.0.0:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/buffer-from/-/buffer-from-1.1.1.tgz#32713bc028f75c02fdb710d7c7bcec1f2c6070ef"
  integrity sha512-MQcXEUbCKtEo7bhqEs6560Hyd4XaovZlO/k9V3hjVUF/zwW7KBVdSK4gIt/bzwS9MbR5qob+F5jusZsb0YQK2A==

buffer-indexof@^1.0.0:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/buffer-indexof/-/buffer-indexof-1.1.1.tgz#52fabcc6a606d1a00302802648ef68f639da268c"
  integrity sha512-4/rOEg86jivtPTeOUUT61jJO1Ya1TrR/OkqCSZDyq84WJh3LuuiphBYJN+fm5xufIk4XAFcEwte/8WzC8If/1g==

buffer-xor@^1.0.3:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/buffer-xor/-/buffer-xor-1.0.3.tgz#26e61ed1422fb70dd42e6e36729ed51d855fe8d9"
  integrity sha1-JuYe0UIvtw3ULm42cp7VHYVf6Nk=

buffer@^4.3.0:
  version "4.9.2"
  resolved "https://registry.yarnpkg.com/buffer/-/buffer-4.9.2.tgz#230ead344002988644841ab0244af8c44bbe3ef8"
  integrity sha512-xq+q3SRMOxGivLhBNaUdC64hDTQwejJ+H0T/NB1XMtTVEwNTrfFF3gAxiyW0Bu/xWEGhjVKgUcMhCrUy2+uCWg==
  dependencies:
    base64-js "^1.0.2"
    ieee754 "^1.1.4"
    isarray "^1.0.0"

builtin-status-codes@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/builtin-status-codes/-/builtin-status-codes-3.0.0.tgz#85982878e21b98e1c66425e03d0174788f569ee8"
  integrity sha1-hZgoeOIbmOHGZCXgPQF0eI9Wnug=

bytes@3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/bytes/-/bytes-3.0.0.tgz#d32815404d689699f85a4ea4fa8755dd13a96048"
  integrity sha1-0ygVQE1olpn4Wk6k+odV3ROpYEg=

bytes@3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/bytes/-/bytes-3.1.0.tgz#f6cf7933a360e0588fa9fde85651cdc7f805d1f6"
  integrity sha512-zauLjrfCG+xvoyaqLoV8bLVXXNGC4JqlxFCutSDWA6fJrTo2ZuvLYTqZ7aHBLZSMOopbzwv8f+wZcVzfVTI2Dg==

cacache@^12.0.2:
  version "12.0.3"
  resolved "https://registry.yarnpkg.com/cacache/-/cacache-12.0.3.tgz#be99abba4e1bf5df461cd5a2c1071fc432573390"
  integrity sha512-kqdmfXEGFepesTuROHMs3MpFLWrPkSSpRqOw80RCflZXy/khxaArvFrQ7uJxSUduzAufc6G0g1VUCOZXxWavPw==
  dependencies:
    bluebird "^3.5.5"
    chownr "^1.1.1"
    figgy-pudding "^3.5.1"
    glob "^7.1.4"
    graceful-fs "^4.1.15"
    infer-owner "^1.0.3"
    lru-cache "^5.1.1"
    mississippi "^3.0.0"
    mkdirp "^0.5.1"
    move-concurrently "^1.0.1"
    promise-inflight "^1.0.1"
    rimraf "^2.6.3"
    ssri "^6.0.1"
    unique-filename "^1.1.1"
    y18n "^4.0.0"

cacache@^13.0.1:
  version "13.0.1"
  resolved "https://registry.yarnpkg.com/cacache/-/cacache-13.0.1.tgz#a8000c21697089082f85287a1aec6e382024a71c"
  integrity sha512-5ZvAxd05HDDU+y9BVvcqYu2LLXmPnQ0hW62h32g4xBTgL/MppR4/04NHfj/ycM2y6lmTnbw6HVi+1eN0Psba6w==
  dependencies:
    chownr "^1.1.2"
    figgy-pudding "^3.5.1"
    fs-minipass "^2.0.0"
    glob "^7.1.4"
    graceful-fs "^4.2.2"
    infer-owner "^1.0.4"
    lru-cache "^5.1.1"
    minipass "^3.0.0"
    minipass-collect "^1.0.2"
    minipass-flush "^1.0.5"
    minipass-pipeline "^1.2.2"
    mkdirp "^0.5.1"
    move-concurrently "^1.0.1"
    p-map "^3.0.0"
    promise-inflight "^1.0.1"
    rimraf "^2.7.1"
    ssri "^7.0.0"
    unique-filename "^1.1.1"

cache-base@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/cache-base/-/cache-base-1.0.1.tgz#0a7f46416831c8b662ee36fe4e7c59d76f666ab2"
  integrity sha512-AKcdTnFSWATd5/GCPRxr2ChwIJ85CeyrEyjRHlKxQ56d4XJMGym0uAiKn0xbLOGOl3+yRpOTi484dVCEc5AUzQ==
  dependencies:
    collection-visit "^1.0.0"
    component-emitter "^1.2.1"
    get-value "^2.0.6"
    has-value "^1.0.0"
    isobject "^3.0.1"
    set-value "^2.0.0"
    to-object-path "^0.3.0"
    union-value "^1.0.0"
    unset-value "^1.0.0"

call-me-maybe@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/call-me-maybe/-/call-me-maybe-1.0.1.tgz#26d208ea89e37b5cbde60250a15f031c16a4d66b"
  integrity sha1-JtII6onje1y95gJQoV8DHBak1ms=

caller-callsite@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/caller-callsite/-/caller-callsite-2.0.0.tgz#847e0fce0a223750a9a027c54b33731ad3154134"
  integrity sha1-hH4PzgoiN1CpoCfFSzNzGtMVQTQ=
  dependencies:
    callsites "^2.0.0"

caller-path@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/caller-path/-/caller-path-2.0.0.tgz#468f83044e369ab2010fac5f06ceee15bb2cb1f4"
  integrity sha1-Ro+DBE42mrIBD6xfBs7uFbsssfQ=
  dependencies:
    caller-callsite "^2.0.0"

callsites@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/callsites/-/callsites-2.0.0.tgz#06eb84f00eea413da86affefacbffb36093b3c50"
  integrity sha1-BuuE8A7qQT2oav/vrL/7Ngk7PFA=

callsites@^3.0.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/callsites/-/callsites-3.1.0.tgz#b3630abd8943432f54b3f0519238e33cd7df2f73"
  integrity sha512-P8BjAsXvZS+VIDUI11hHCQEv74YT67YUi5JJFNWIqL235sBmjX4+qx9Muvls5ivyNENctx46xQLQ3aTuE7ssaQ==

camel-case@^4.1.1:
  version "4.1.1"
  resolved "https://registry.yarnpkg.com/camel-case/-/camel-case-4.1.1.tgz#1fc41c854f00e2f7d0139dfeba1542d6896fe547"
  integrity sha512-7fa2WcG4fYFkclIvEmxBbTvmibwF2/agfEBc6q3lOpVu0A13ltLsA+Hr/8Hp6kp5f+G7hKi6t8lys6XxP+1K6Q==
  dependencies:
    pascal-case "^3.1.1"
    tslib "^1.10.0"

camelcase@5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/camelcase/-/camelcase-5.0.0.tgz#03295527d58bd3cd4aa75363f35b2e8d97be2f42"
  integrity sha512-faqwZqnWxbxn+F1d399ygeamQNy3lPp/H9H6rNrqYh4FSVCtcY+3cub1MxA8o9mDd55mM8Aghuu/kuyYA6VTsA==

camelcase@5.3.1, camelcase@^5.0.0, camelcase@^5.3.1:
  version "5.3.1"
  resolved "https://registry.yarnpkg.com/camelcase/-/camelcase-5.3.1.tgz#e3c9b31569e106811df242f715725a1f4c494320"
  integrity sha512-L28STB170nwWS63UjtlEOE3dldQApaJXZkOI1uMFfzf3rRuPegHaHesyee+YxQ+W6SvRDQV6UrdOdRiR153wJg==

caniuse-api@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/caniuse-api/-/caniuse-api-3.0.0.tgz#5e4d90e2274961d46291997df599e3ed008ee4c0"
  integrity sha512-bsTwuIg/BZZK/vreVTYYbSWoe2F+71P7K5QGEX+pT250DZbfU1MQ5prOKpPR+LL6uWKK3KMwMCAS74QB3Um1uw==
  dependencies:
    browserslist "^4.0.0"
    caniuse-lite "^1.0.0"
    lodash.memoize "^4.1.2"
    lodash.uniq "^4.5.0"

caniuse-lite@^1.0.0, caniuse-lite@^1.0.30000981, caniuse-lite@^1.0.30001020, caniuse-lite@^1.0.30001035:
  version "1.0.30001035"
  resolved "https://registry.yarnpkg.com/caniuse-lite/-/caniuse-lite-1.0.30001035.tgz#2bb53b8aa4716b2ed08e088d4dc816a5fe089a1e"
  integrity sha512-C1ZxgkuA4/bUEdMbU5WrGY4+UhMFFiXrgNAfxiMIqWgFTWfv/xsZCS2xEHT2LMq7xAZfuAnu6mcqyDl0ZR6wLQ==

capture-exit@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/capture-exit/-/capture-exit-2.0.0.tgz#fb953bfaebeb781f62898239dabb426d08a509a4"
  integrity sha512-PiT/hQmTonHhl/HFGN+Lx3JJUznrVYJ3+AQsnthneZbvW7x+f08Tk7yLJTLEOUvBTbduLeeBkxEaYXUOUrRq6g==
  dependencies:
    rsvp "^4.8.4"

case-sensitive-paths-webpack-plugin@2.3.0:
  version "2.3.0"
  resolved "https://registry.yarnpkg.com/case-sensitive-paths-webpack-plugin/-/case-sensitive-paths-webpack-plugin-2.3.0.tgz#23ac613cc9a856e4f88ff8bb73bbb5e989825cf7"
  integrity sha512-/4YgnZS8y1UXXmC02xD5rRrBEu6T5ub+mQHLNRj0fzTRbgdBYhsNo2V5EqwgqrExjxsjtF/OpAKAMkKsxbD5XQ==

caseless@~0.12.0:
  version "0.12.0"
  resolved "https://registry.yarnpkg.com/caseless/-/caseless-0.12.0.tgz#1b681c21ff84033c826543090689420d187151dc"
  integrity sha1-G2gcIf+EAzyCZUMJBolCDRhxUdw=

chalk@2.4.2, chalk@^2.0.0, chalk@^2.0.1, chalk@^2.1.0, chalk@^2.4.1, chalk@^2.4.2:
  version "2.4.2"
  resolved "https://registry.yarnpkg.com/chalk/-/chalk-2.4.2.tgz#cd42541677a54333cf541a49108c1432b44c9424"
  integrity sha512-Mti+f9lpJNcwF4tWV8/OrTTtF1gZi+f8FqlyAdouralcFWFQWF2+NgCHShjkCb+IFBLq9buZwE1xckQU4peSuQ==
  dependencies:
    ansi-styles "^3.2.1"
    escape-string-regexp "^1.0.5"
    supports-color "^5.3.0"

chalk@^1.1.3:
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/chalk/-/chalk-1.1.3.tgz#a8115c55e4a702fe4d150abd3872822a7e09fc98"
  integrity sha1-qBFcVeSnAv5NFQq9OHKCKn4J/Jg=
  dependencies:
    ansi-styles "^2.2.1"
    escape-string-regexp "^1.0.2"
    has-ansi "^2.0.0"
    strip-ansi "^3.0.0"
    supports-color "^2.0.0"

chalk@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/chalk/-/chalk-3.0.0.tgz#3f73c2bf526591f574cc492c51e2456349f844e4"
  integrity sha512-4D3B6Wf41KOYRFdszmDqMCGq5VV/uMAB273JILmO+3jAlh8X4qDtdtgCR3fxtbLEMzSx22QdhnDcJvu2u1fVwg==
  dependencies:
    ansi-styles "^4.1.0"
    supports-color "^7.1.0"

chardet@^0.7.0:
  version "0.7.0"
  resolved "https://registry.yarnpkg.com/chardet/-/chardet-0.7.0.tgz#90094849f0937f2eedc2425d0d28a9e5f0cbad9e"
  integrity sha512-mT8iDcrh03qDGRRmoA2hmBJnxpllMR+0/0qlzjqZES6NdiWDcZkCNAk4rPFZ9Q85r27unkiNNg8ZOiwZXBHwcA==

chokidar@^2.0.2, chokidar@^2.1.8:
  version "2.1.8"
  resolved "https://registry.yarnpkg.com/chokidar/-/chokidar-2.1.8.tgz#804b3a7b6a99358c3c5c61e71d8728f041cff917"
  integrity sha512-ZmZUazfOzf0Nve7duiCKD23PFSCs4JPoYyccjUFF3aQkQadqBhfzhjkwBH2mNOG9cTBwhamM37EIsIkZw3nRgg==
  dependencies:
    anymatch "^2.0.0"
    async-each "^1.0.1"
    braces "^2.3.2"
    glob-parent "^3.1.0"
    inherits "^2.0.3"
    is-binary-path "^1.0.0"
    is-glob "^4.0.0"
    normalize-path "^3.0.0"
    path-is-absolute "^1.0.0"
    readdirp "^2.2.1"
    upath "^1.1.1"
  optionalDependencies:
    fsevents "^1.2.7"

chokidar@^3.3.0:
  version "3.3.1"
  resolved "https://registry.yarnpkg.com/chokidar/-/chokidar-3.3.1.tgz#c84e5b3d18d9a4d77558fef466b1bf16bbeb3450"
  integrity sha512-4QYCEWOcK3OJrxwvyyAOxFuhpvOVCYkr33LPfFNBjAD/w3sEzWsp2BUOkI4l9bHvWioAd0rc6NlHUOEaWkTeqg==
  dependencies:
    anymatch "~3.1.1"
    braces "~3.0.2"
    glob-parent "~5.1.0"
    is-binary-path "~2.1.0"
    is-glob "~4.0.1"
    normalize-path "~3.0.0"
    readdirp "~3.3.0"
  optionalDependencies:
    fsevents "~2.1.2"

chownr@^1.1.1, chownr@^1.1.2:
  version "1.1.4"
  resolved "https://registry.yarnpkg.com/chownr/-/chownr-1.1.4.tgz#6fc9d7b42d32a583596337666e7d08084da2cc6b"
  integrity sha512-jJ0bqzaylmJtVnNgzTeSOs8DPavpbYgEr/b0YL8/2GO3xJEhInFmhKMUnEJQjZumK7KXGFhUy89PrsJWlakBVg==

chrome-trace-event@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/chrome-trace-event/-/chrome-trace-event-1.0.2.tgz#234090ee97c7d4ad1a2c4beae27505deffc608a4"
  integrity sha512-9e/zx1jw7B4CO+c/RXoCsfg/x1AfUBioy4owYH0bJprEYAx5hRFLRhWBqHAG57D0ZM4H7vxbP7bPe0VwhQRYDQ==
  dependencies:
    tslib "^1.9.0"

ci-info@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/ci-info/-/ci-info-2.0.0.tgz#67a9e964be31a51e15e5010d58e6f12834002f46"
  integrity sha512-5tK7EtrZ0N+OLFMthtqOj4fI2Jeb88C4CAZPu25LDVUgXJ0A3Js4PMGqrn0JU1W0Mh1/Z8wZzYPxqUrXeBboCQ==

cipher-base@^1.0.0, cipher-base@^1.0.1, cipher-base@^1.0.3:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/cipher-base/-/cipher-base-1.0.4.tgz#8760e4ecc272f4c363532f926d874aae2c1397de"
  integrity sha512-Kkht5ye6ZGmwv40uUDZztayT2ThLQGfnj/T71N/XzeZeo3nf8foyW7zGTsPYkEya3m5f3cAypH+qe7YOrM1U2Q==
  dependencies:
    inherits "^2.0.1"
    safe-buffer "^5.0.1"

class-utils@^0.3.5:
  version "0.3.6"
  resolved "https://registry.yarnpkg.com/class-utils/-/class-utils-0.3.6.tgz#f93369ae8b9a7ce02fd41faad0ca83033190c463"
  integrity sha512-qOhPa/Fj7s6TY8H8esGu5QNpMMQxz79h+urzrNYN6mn+9BnxlDGf5QZ+XeCDsxSjPqsSR56XOZOJmpeurnLMeg==
  dependencies:
    arr-union "^3.1.0"
    define-property "^0.2.5"
    isobject "^3.0.0"
    static-extend "^0.1.1"

clean-css@^4.2.3:
  version "4.2.3"
  resolved "https://registry.yarnpkg.com/clean-css/-/clean-css-4.2.3.tgz#507b5de7d97b48ee53d84adb0160ff6216380f78"
  integrity sha512-VcMWDN54ZN/DS+g58HYL5/n4Zrqe8vHJpGA8KdgUXFU4fuP/aHNw8eld9SyEIyabIMJX/0RaY/fplOo5hYLSFA==
  dependencies:
    source-map "~0.6.0"

clean-stack@^2.0.0:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/clean-stack/-/clean-stack-2.2.0.tgz#ee8472dbb129e727b31e8a10a427dee9dfe4008b"
  integrity sha512-4diC9HaTE+KRAMWhDhrGOECgWZxoevMc5TlkObMqNSsVU62PYzXZ/SMTjzyGAFF1YusgxGcSWTEXBhp0CPwQ1A==

cli-cursor@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/cli-cursor/-/cli-cursor-3.1.0.tgz#264305a7ae490d1d03bf0c9ba7c925d1753af307"
  integrity sha512-I/zHAwsKf9FqGoXM4WWRACob9+SNukZTd94DWF57E4toouRulbCxcUh6RKUEOQlYTHJnzkPMySvPNaaSLNfLZw==
  dependencies:
    restore-cursor "^3.1.0"

cli-width@^2.0.0:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/cli-width/-/cli-width-2.2.0.tgz#ff19ede8a9a5e579324147b0c11f0fbcbabed639"
  integrity sha1-/xnt6Kml5XkyQUewwR8PvLq+1jk=

cliui@^4.0.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/cliui/-/cliui-4.1.0.tgz#348422dbe82d800b3022eef4f6ac10bf2e4d1b49"
  integrity sha512-4FG+RSG9DL7uEwRUZXZn3SS34DiDPfzP0VOiEwtUWlE+AR2EIg+hSyvrIgUUfhdgR/UkAeW2QHgeP+hWrXs7jQ==
  dependencies:
    string-width "^2.1.1"
    strip-ansi "^4.0.0"
    wrap-ansi "^2.0.0"

cliui@^5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/cliui/-/cliui-5.0.0.tgz#deefcfdb2e800784aa34f46fa08e06851c7bbbc5"
  integrity sha512-PYeGSEmmHM6zvoef2w8TPzlrnNpXIjTipYK780YswmIP9vjxmd6Y2a3CB2Ks6/AU8NHjZugXvo8w3oWM2qnwXA==
  dependencies:
    string-width "^3.1.0"
    strip-ansi "^5.2.0"
    wrap-ansi "^5.1.0"

clone-deep@^0.2.4:
  version "0.2.4"
  resolved "https://registry.yarnpkg.com/clone-deep/-/clone-deep-0.2.4.tgz#4e73dd09e9fb971cc38670c5dced9c1896481cc6"
  integrity sha1-TnPdCen7lxzDhnDF3O2cGJZIHMY=
  dependencies:
    for-own "^0.1.3"
    is-plain-object "^2.0.1"
    kind-of "^3.0.2"
    lazy-cache "^1.0.3"
    shallow-clone "^0.1.2"

clone-deep@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/clone-deep/-/clone-deep-4.0.1.tgz#c19fd9bdbbf85942b4fd979c84dcf7d5f07c2387"
  integrity sha512-neHB9xuzh/wk0dIHweyAXv2aPGZIVk3pLMe+/RNzINf17fe0OG96QroktYAUm7SM1PBnzTabaLboqqxDyMU+SQ==
  dependencies:
    is-plain-object "^2.0.4"
    kind-of "^6.0.2"
    shallow-clone "^3.0.0"

co@^4.6.0:
  version "4.6.0"
  resolved "https://registry.yarnpkg.com/co/-/co-4.6.0.tgz#6ea6bdf3d853ae54ccb8e47bfa0bf3f9031fb184"
  integrity sha1-bqa989hTrlTMuOR7+gvz+QMfsYQ=

coa@^2.0.2:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/coa/-/coa-2.0.2.tgz#43f6c21151b4ef2bf57187db0d73de229e3e7ec3"
  integrity sha512-q5/jG+YQnSy4nRTV4F7lPepBJZ8qBNJJDBuJdoejDyLXgmL7IEo+Le2JDZudFTFt7mrCqIRaSjws4ygRCTCAXA==
  dependencies:
    "@types/q" "^1.5.1"
    chalk "^2.4.1"
    q "^1.1.2"

code-point-at@^1.0.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/code-point-at/-/code-point-at-1.1.0.tgz#0d070b4d043a5bea33a2f1a40e2edb3d9a4ccf77"
  integrity sha1-DQcLTQQ6W+ozovGkDi7bPZpMz3c=

collection-visit@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/collection-visit/-/collection-visit-1.0.0.tgz#4bc0373c164bc3291b4d368c829cf1a80a59dca0"
  integrity sha1-S8A3PBZLwykbTTaMgpzxqApZ3KA=
  dependencies:
    map-visit "^1.0.0"
    object-visit "^1.0.0"

color-convert@^1.9.0, color-convert@^1.9.1:
  version "1.9.3"
  resolved "https://registry.yarnpkg.com/color-convert/-/color-convert-1.9.3.tgz#bb71850690e1f136567de629d2d5471deda4c1e8"
  integrity sha512-QfAUtd+vFdAtFQcC8CCyYt1fYWxSqAiK2cSD6zDB8N3cpsEBAvRxp9zOGg6G/SHHJYAT88/az/IuDGALsNVbGg==
  dependencies:
    color-name "1.1.3"

color-convert@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/color-convert/-/color-convert-2.0.1.tgz#72d3a68d598c9bdb3af2ad1e84f21d896abd4de3"
  integrity sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==
  dependencies:
    color-name "~1.1.4"

color-name@1.1.3:
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/color-name/-/color-name-1.1.3.tgz#a7d0558bd89c42f795dd42328f740831ca53bc25"
  integrity sha1-p9BVi9icQveV3UIyj3QIMcpTvCU=

color-name@^1.0.0, color-name@~1.1.4:
  version "1.1.4"
  resolved "https://registry.yarnpkg.com/color-name/-/color-name-1.1.4.tgz#c2a09a87acbde69543de6f63fa3995c826c536a2"
  integrity sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA==

color-string@^1.5.2:
  version "1.5.3"
  resolved "https://registry.yarnpkg.com/color-string/-/color-string-1.5.3.tgz#c9bbc5f01b58b5492f3d6857459cb6590ce204cc"
  integrity sha512-dC2C5qeWoYkxki5UAXapdjqO672AM4vZuPGRQfO8b5HKuKGBbKWpITyDYN7TOFKvRW7kOgAn3746clDBMDJyQw==
  dependencies:
    color-name "^1.0.0"
    simple-swizzle "^0.2.2"

color@^3.0.0:
  version "3.1.2"
  resolved "https://registry.yarnpkg.com/color/-/color-3.1.2.tgz#68148e7f85d41ad7649c5fa8c8106f098d229e10"
  integrity sha512-vXTJhHebByxZn3lDvDJYw4lR5+uB3vuoHsuYA5AKuxRVn5wzzIfQKGLBmgdVRHKTJYeK5rvJcHnrd0Li49CFpg==
  dependencies:
    color-convert "^1.9.1"
    color-string "^1.5.2"

combined-stream@^1.0.6, combined-stream@~1.0.6:
  version "1.0.8"
  resolved "https://registry.yarnpkg.com/combined-stream/-/combined-stream-1.0.8.tgz#c3d45a8b34fd730631a110a8a2520682b31d5a7f"
  integrity sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==
  dependencies:
    delayed-stream "~1.0.0"

commander@^2.11.0, commander@^2.20.0:
  version "2.20.3"
  resolved "https://registry.yarnpkg.com/commander/-/commander-2.20.3.tgz#fd485e84c03eb4881c20722ba48035e8531aeb33"
  integrity sha512-GpVkmM8vF2vQUkj2LvZmD35JxeJOLCwJ9cUkugyk2nuhbv3+mJvpLYYt+0+USMxE+oj+ey/lJEnhZw75x/OMcQ==

commander@^4.1.1:
  version "4.1.1"
  resolved "https://registry.yarnpkg.com/commander/-/commander-4.1.1.tgz#9fd602bd936294e9e9ef46a3f4d6964044b18068"
  integrity sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==

common-tags@^1.8.0:
  version "1.8.0"
  resolved "https://registry.yarnpkg.com/common-tags/-/common-tags-1.8.0.tgz#8e3153e542d4a39e9b10554434afaaf98956a937"
  integrity sha512-6P6g0uetGpW/sdyUy/iQQCbFF0kWVMSIVSyYz7Zgjcgh8mgw8PQzDNZeyZ5DQ2gM7LBoZPHmnjz8rUthkBG5tw==

commondir@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/commondir/-/commondir-1.0.1.tgz#ddd800da0c66127393cca5950ea968a3aaf1253b"
  integrity sha1-3dgA2gxmEnOTzKWVDqloo6rxJTs=

component-emitter@^1.2.1:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/component-emitter/-/component-emitter-1.3.0.tgz#16e4070fba8ae29b679f2215853ee181ab2eabc0"
  integrity sha512-Rd3se6QB+sO1TwqZjscQrurpEPIfO0/yYnSin6Q/rD3mOutHvUrCAhJub3r90uNb+SESBuE0QYoB90YdfatsRg==

compose-function@3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/compose-function/-/compose-function-3.0.3.tgz#9ed675f13cc54501d30950a486ff6a7ba3ab185f"
  integrity sha1-ntZ18TzFRQHTCVCkhv9qe6OrGF8=
  dependencies:
    arity-n "^1.0.4"

compressible@~2.0.16:
  version "2.0.18"
  resolved "https://registry.yarnpkg.com/compressible/-/compressible-2.0.18.tgz#af53cca6b070d4c3c0750fbd77286a6d7cc46fba"
  integrity sha512-AF3r7P5dWxL8MxyITRMlORQNaOA2IkAFaTr4k7BUumjPtRpGDTZpl0Pb1XCO6JeDCBdp126Cgs9sMxqSjgYyRg==
  dependencies:
    mime-db ">= 1.43.0 < 2"

compression@^1.7.4:
  version "1.7.4"
  resolved "https://registry.yarnpkg.com/compression/-/compression-1.7.4.tgz#95523eff170ca57c29a0ca41e6fe131f41e5bb8f"
  integrity sha512-jaSIDzP9pZVS4ZfQ+TzvtiWhdpFhE2RDHz8QJkpX9SIpLq88VueF5jJw6t+6CUQcAoA6t+x89MLrWAqpfDE8iQ==
  dependencies:
    accepts "~1.3.5"
    bytes "3.0.0"
    compressible "~2.0.16"
    debug "2.6.9"
    on-headers "~1.0.2"
    safe-buffer "5.1.2"
    vary "~1.1.2"

concat-map@0.0.1:
  version "0.0.1"
  resolved "https://registry.yarnpkg.com/concat-map/-/concat-map-0.0.1.tgz#d8a96bd77fd68df7793a73036a3ba0d5405d477b"
  integrity sha1-2Klr13/Wjfd5OnMDajug1UBdR3s=

concat-stream@^1.5.0:
  version "1.6.2"
  resolved "https://registry.yarnpkg.com/concat-stream/-/concat-stream-1.6.2.tgz#904bdf194cd3122fc675c77fc4ac3d4ff0fd1a34"
  integrity sha512-27HBghJxjiZtIk3Ycvn/4kbJk/1uZuJFfuPEns6LaEvpvG1f0hTea8lilrouyo9mVc2GWdcEZ8OLoGmSADlrCw==
  dependencies:
    buffer-from "^1.0.0"
    inherits "^2.0.3"
    readable-stream "^2.2.2"
    typedarray "^0.0.6"

confusing-browser-globals@^1.0.9:
  version "1.0.9"
  resolved "https://registry.yarnpkg.com/confusing-browser-globals/-/confusing-browser-globals-1.0.9.tgz#72bc13b483c0276801681871d4898516f8f54fdd"
  integrity sha512-KbS1Y0jMtyPgIxjO7ZzMAuUpAKMt1SzCL9fsrKsX6b0zJPTaT0SiSPmewwVZg9UAO83HVIlEhZF84LIjZ0lmAw==

connect-history-api-fallback@^1.6.0:
  version "1.6.0"
  resolved "https://registry.yarnpkg.com/connect-history-api-fallback/-/connect-history-api-fallback-1.6.0.tgz#8b32089359308d111115d81cad3fceab888f97bc"
  integrity sha512-e54B99q/OUoH64zYYRf3HBP5z24G38h5D3qXu23JGRoigpX5Ss4r9ZnDk3g0Z8uQC2x2lPaJ+UlWBc1ZWBWdLg==

console-browserify@^1.1.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/console-browserify/-/console-browserify-1.2.0.tgz#67063cef57ceb6cf4993a2ab3a55840ae8c49336"
  integrity sha512-ZMkYO/LkF17QvCPqM0gxw8yUzigAOZOSWSHg91FH6orS7vcEj5dVZTidN2fQ14yBSdg97RqhSNwLUXInd52OTA==

constants-browserify@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/constants-browserify/-/constants-browserify-1.0.0.tgz#c20b96d8c617748aaf1c16021760cd27fcb8cb75"
  integrity sha1-wguW2MYXdIqvHBYCF2DNJ/y4y3U=

contains-path@^0.1.0:
  version "0.1.0"
  resolved "https://registry.yarnpkg.com/contains-path/-/contains-path-0.1.0.tgz#fe8cf184ff6670b6baef01a9d4861a5cbec4120a"
  integrity sha1-/ozxhP9mcLa67wGp1IYaXL7EEgo=

content-disposition@0.5.3:
  version "0.5.3"
  resolved "https://registry.yarnpkg.com/content-disposition/-/content-disposition-0.5.3.tgz#e130caf7e7279087c5616c2007d0485698984fbd"
  integrity sha512-ExO0774ikEObIAEV9kDo50o+79VCUdEB6n6lzKgGwupcVeRlhrj3qGAfwq8G6uBJjkqLrhT0qEYFcWng8z1z0g==
  dependencies:
    safe-buffer "5.1.2"

content-type@~1.0.4:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/content-type/-/content-type-1.0.4.tgz#e138cc75e040c727b1966fe5e5f8c9aee256fe3b"
  integrity sha512-hIP3EEPs8tB9AT1L+NUqtwOAps4mk2Zob89MWXMHjHWg9milF/j4osnnQLXBCBFBk/tvIG/tUc9mOUJiPBhPXA==

convert-source-map@1.7.0, convert-source-map@^1.4.0, convert-source-map@^1.7.0:
  version "1.7.0"
  resolved "https://registry.yarnpkg.com/convert-source-map/-/convert-source-map-1.7.0.tgz#17a2cb882d7f77d3490585e2ce6c524424a3a442"
  integrity sha512-4FJkXzKXEDB1snCFZlLP4gpC3JILicCpGbzG9f9G7tGqGCzETQ2hWPrcinA9oU4wtf2biUaEH5065UnMeR33oA==
  dependencies:
    safe-buffer "~5.1.1"

convert-source-map@^0.3.3:
  version "0.3.5"
  resolved "https://registry.yarnpkg.com/convert-source-map/-/convert-source-map-0.3.5.tgz#f1d802950af7dd2631a1febe0596550c86ab3190"
  integrity sha1-8dgClQr33SYxof6+BZZVDIarMZA=

cookie-signature@1.0.6:
  version "1.0.6"
  resolved "https://registry.yarnpkg.com/cookie-signature/-/cookie-signature-1.0.6.tgz#e303a882b342cc3ee8ca513a79999734dab3ae2c"
  integrity sha1-4wOogrNCzD7oylE6eZmXNNqzriw=

cookie@0.4.0:
  version "0.4.0"
  resolved "https://registry.yarnpkg.com/cookie/-/cookie-0.4.0.tgz#beb437e7022b3b6d49019d088665303ebe9c14ba"
  integrity sha512-+Hp8fLp57wnUSt0tY0tHEXh4voZRDnoIrZPqlo3DPiI4y9lwg/jqx+1Om94/W6ZaPDOUbnjOt/99w66zk+l1Xg==

copy-concurrently@^1.0.0:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/copy-concurrently/-/copy-concurrently-1.0.5.tgz#92297398cae34937fcafd6ec8139c18051f0b5e0"
  integrity sha512-f2domd9fsVDFtaFcbaRZuYXwtdmnzqbADSwhSWYxYB/Q8zsdUUFMXVRwXGDMWmbEzAn1kdRrtI1T/KTFOL4X2A==
  dependencies:
    aproba "^1.1.1"
    fs-write-stream-atomic "^1.0.8"
    iferr "^0.1.5"
    mkdirp "^0.5.1"
    rimraf "^2.5.4"
    run-queue "^1.0.0"

copy-descriptor@^0.1.0:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/copy-descriptor/-/copy-descriptor-0.1.1.tgz#676f6eb3c39997c2ee1ac3a924fd6124748f578d"
  integrity sha1-Z29us8OZl8LuGsOpJP1hJHSPV40=

core-js-compat@^3.6.2:
  version "3.6.4"
  resolved "https://registry.yarnpkg.com/core-js-compat/-/core-js-compat-3.6.4.tgz#938476569ebb6cda80d339bcf199fae4f16fff17"
  integrity sha512-zAa3IZPvsJ0slViBQ2z+vgyyTuhd3MFn1rBQjZSKVEgB0UMYhUkCj9jJUVPgGTGqWvsBVmfnruXgTcNyTlEiSA==
  dependencies:
    browserslist "^4.8.3"
    semver "7.0.0"

core-js-pure@^3.0.0:
  version "3.6.4"
  resolved "https://registry.yarnpkg.com/core-js-pure/-/core-js-pure-3.6.4.tgz#4bf1ba866e25814f149d4e9aaa08c36173506e3a"
  integrity sha512-epIhRLkXdgv32xIUFaaAry2wdxZYBi6bgM7cB136dzzXXa+dFyRLTZeLUJxnd8ShrmyVXBub63n2NHo2JAt8Cw==

core-js@^2.4.0:
  version "2.6.11"
  resolved "https://registry.yarnpkg.com/core-js/-/core-js-2.6.11.tgz#38831469f9922bded8ee21c9dc46985e0399308c"
  integrity sha512-5wjnpaT/3dV+XB4borEsnAYQchn00XSgTAWKDkEqv+K8KevjbzmofK6hfJ9TZIlpj2N0xQpazy7PiRQiWHqzWg==

core-js@^3.5.0:
  version "3.6.4"
  resolved "https://registry.yarnpkg.com/core-js/-/core-js-3.6.4.tgz#440a83536b458114b9cb2ac1580ba377dc470647"
  integrity sha512-4paDGScNgZP2IXXilaffL9X7968RuvwlkK3xWtZRVqgd8SYNiVKRJvkFd1aqqEuPfN7E68ZHEp9hDj6lHj4Hyw==

core-util-is@1.0.2, core-util-is@~1.0.0:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/core-util-is/-/core-util-is-1.0.2.tgz#b5fd54220aa2bc5ab57aab7140c940754503c1a7"
  integrity sha1-tf1UIgqivFq1eqtxQMlAdUUDwac=

cosmiconfig@^5.0.0, cosmiconfig@^5.2.1:
  version "5.2.1"
  resolved "https://registry.yarnpkg.com/cosmiconfig/-/cosmiconfig-5.2.1.tgz#040f726809c591e77a17c0a3626ca45b4f168b1a"
  integrity sha512-H65gsXo1SKjf8zmrJ67eJk8aIRKV5ff2D4uKZIBZShbhGSpEmsQOPW/SKMKYhSTrqR7ufy6RP69rPogdaPh/kA==
  dependencies:
    import-fresh "^2.0.0"
    is-directory "^0.3.1"
    js-yaml "^3.13.1"
    parse-json "^4.0.0"

cosmiconfig@^6.0.0:
  version "6.0.0"
  resolved "https://registry.yarnpkg.com/cosmiconfig/-/cosmiconfig-6.0.0.tgz#da4fee853c52f6b1e6935f41c1a2fc50bd4a9982"
  integrity sha512-xb3ZL6+L8b9JLLCx3ZdoZy4+2ECphCMo2PwqgP1tlfVq6M6YReyzBJtvWWtbDSpNr9hn96pkCiZqUcFEc+54Qg==
  dependencies:
    "@types/parse-json" "^4.0.0"
    import-fresh "^3.1.0"
    parse-json "^5.0.0"
    path-type "^4.0.0"
    yaml "^1.7.2"

create-ecdh@^4.0.0:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/create-ecdh/-/create-ecdh-4.0.3.tgz#c9111b6f33045c4697f144787f9254cdc77c45ff"
  integrity sha512-GbEHQPMOswGpKXM9kCWVrremUcBmjteUaQ01T9rkKCPDXfUHX0IoP9LpHYo2NPFampa4e+/pFDc3jQdxrxQLaw==
  dependencies:
    bn.js "^4.1.0"
    elliptic "^6.0.0"

create-hash@^1.1.0, create-hash@^1.1.2:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/create-hash/-/create-hash-1.2.0.tgz#889078af11a63756bcfb59bd221996be3a9ef196"
  integrity sha512-z00bCGNHDG8mHAkP7CtT1qVu+bFQUPjYq/4Iv3C3kWjTFV10zIjfSoeqXo9Asws8gwSHDGj/hl2u4OGIjapeCg==
  dependencies:
    cipher-base "^1.0.1"
    inherits "^2.0.1"
    md5.js "^1.3.4"
    ripemd160 "^2.0.1"
    sha.js "^2.4.0"

create-hmac@^1.1.0, create-hmac@^1.1.2, create-hmac@^1.1.4:
  version "1.1.7"
  resolved "https://registry.yarnpkg.com/create-hmac/-/create-hmac-1.1.7.tgz#69170c78b3ab957147b2b8b04572e47ead2243ff"
  integrity sha512-MJG9liiZ+ogc4TzUwuvbER1JRdgvUFSB5+VR/g5h82fGaIRWMWddtKBHi7/sVhfjQZ6SehlyhvQYrcYkaUIpLg==
  dependencies:
    cipher-base "^1.0.3"
    create-hash "^1.1.0"
    inherits "^2.0.1"
    ripemd160 "^2.0.0"
    safe-buffer "^5.0.1"
    sha.js "^2.4.8"

cross-spawn@7.0.1:
  version "7.0.1"
  resolved "https://registry.yarnpkg.com/cross-spawn/-/cross-spawn-7.0.1.tgz#0ab56286e0f7c24e153d04cc2aa027e43a9a5d14"
  integrity sha512-u7v4o84SwFpD32Z8IIcPZ6z1/ie24O6RU3RbtL5Y316l3KuHVPx9ItBgWQ6VlfAFnRnTtMUrsQ9MUUTuEZjogg==
  dependencies:
    path-key "^3.1.0"
    shebang-command "^2.0.0"
    which "^2.0.1"

cross-spawn@^6.0.0, cross-spawn@^6.0.5:
  version "6.0.5"
  resolved "https://registry.yarnpkg.com/cross-spawn/-/cross-spawn-6.0.5.tgz#4a5ec7c64dfae22c3a14124dbacdee846d80cbc4"
  integrity sha512-eTVLrBSt7fjbDygz805pMnstIs2VTBNkRm0qxZd+M7A5XDdxVRWO5MxGBXZhjY4cqLYLdtrGqRf8mBPmzwSpWQ==
  dependencies:
    nice-try "^1.0.4"
    path-key "^2.0.1"
    semver "^5.5.0"
    shebang-command "^1.2.0"
    which "^1.2.9"

crypto-browserify@^3.11.0:
  version "3.12.0"
  resolved "https://registry.yarnpkg.com/crypto-browserify/-/crypto-browserify-3.12.0.tgz#396cf9f3137f03e4b8e532c58f698254e00f80ec"
  integrity sha512-fz4spIh+znjO2VjL+IdhEpRJ3YN6sMzITSBijk6FK2UvTqruSQW+/cCZTSNsMiZNvUeq0CqurF+dAbyiGOY6Wg==
  dependencies:
    browserify-cipher "^1.0.0"
    browserify-sign "^4.0.0"
    create-ecdh "^4.0.0"
    create-hash "^1.1.0"
    create-hmac "^1.1.0"
    diffie-hellman "^5.0.0"
    inherits "^2.0.1"
    pbkdf2 "^3.0.3"
    public-encrypt "^4.0.0"
    randombytes "^2.0.0"
    randomfill "^1.0.3"

css-blank-pseudo@^0.1.4:
  version "0.1.4"
  resolved "https://registry.yarnpkg.com/css-blank-pseudo/-/css-blank-pseudo-0.1.4.tgz#dfdefd3254bf8a82027993674ccf35483bfcb3c5"
  integrity sha512-LHz35Hr83dnFeipc7oqFDmsjHdljj3TQtxGGiNWSOsTLIAubSm4TEz8qCaKFpk7idaQ1GfWscF4E6mgpBysA1w==
  dependencies:
    postcss "^7.0.5"

css-color-names@0.0.4, css-color-names@^0.0.4:
  version "0.0.4"
  resolved "https://registry.yarnpkg.com/css-color-names/-/css-color-names-0.0.4.tgz#808adc2e79cf84738069b646cb20ec27beb629e0"
  integrity sha1-gIrcLnnPhHOAabZGyyDsJ762KeA=

css-declaration-sorter@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/css-declaration-sorter/-/css-declaration-sorter-4.0.1.tgz#c198940f63a76d7e36c1e71018b001721054cb22"
  integrity sha512-BcxQSKTSEEQUftYpBVnsH4SF05NTuBokb19/sBt6asXGKZ/6VP7PLG1CBCkFDYOnhXhPh0jMhO6xZ71oYHXHBA==
  dependencies:
    postcss "^7.0.1"
    timsort "^0.3.0"

css-has-pseudo@^0.10.0:
  version "0.10.0"
  resolved "https://registry.yarnpkg.com/css-has-pseudo/-/css-has-pseudo-0.10.0.tgz#3c642ab34ca242c59c41a125df9105841f6966ee"
  integrity sha512-Z8hnfsZu4o/kt+AuFzeGpLVhFOGO9mluyHBaA2bA8aCGTwah5sT3WV/fTHH8UNZUytOIImuGPrl/prlb4oX4qQ==
  dependencies:
    postcss "^7.0.6"
    postcss-selector-parser "^5.0.0-rc.4"

css-loader@3.4.2:
  version "3.4.2"
  resolved "https://registry.yarnpkg.com/css-loader/-/css-loader-3.4.2.tgz#d3fdb3358b43f233b78501c5ed7b1c6da6133202"
  integrity sha512-jYq4zdZT0oS0Iykt+fqnzVLRIeiPWhka+7BqPn+oSIpWJAHak5tmB/WZrJ2a21JhCeFyNnnlroSl8c+MtVndzA==
  dependencies:
    camelcase "^5.3.1"
    cssesc "^3.0.0"
    icss-utils "^4.1.1"
    loader-utils "^1.2.3"
    normalize-path "^3.0.0"
    postcss "^7.0.23"
    postcss-modules-extract-imports "^2.0.0"
    postcss-modules-local-by-default "^3.0.2"
    postcss-modules-scope "^2.1.1"
    postcss-modules-values "^3.0.0"
    postcss-value-parser "^4.0.2"
    schema-utils "^2.6.0"

css-prefers-color-scheme@^3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/css-prefers-color-scheme/-/css-prefers-color-scheme-3.1.1.tgz#6f830a2714199d4f0d0d0bb8a27916ed65cff1f4"
  integrity sha512-MTu6+tMs9S3EUqzmqLXEcgNRbNkkD/TGFvowpeoWJn5Vfq7FMgsmRQs9X5NXAURiOBmOxm/lLjsDNXDE6k9bhg==
  dependencies:
    postcss "^7.0.5"

css-select-base-adapter@^0.1.1:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/css-select-base-adapter/-/css-select-base-adapter-0.1.1.tgz#3b2ff4972cc362ab88561507a95408a1432135d7"
  integrity sha512-jQVeeRG70QI08vSTwf1jHxp74JoZsr2XSgETae8/xC8ovSnL2WF87GTLO86Sbwdt2lK4Umg4HnnwMO4YF3Ce7w==

css-select@^1.1.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/css-select/-/css-select-1.2.0.tgz#2b3a110539c5355f1cd8d314623e870b121ec858"
  integrity sha1-KzoRBTnFNV8c2NMUYj6HCxIeyFg=
  dependencies:
    boolbase "~1.0.0"
    css-what "2.1"
    domutils "1.5.1"
    nth-check "~1.0.1"

css-select@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/css-select/-/css-select-2.1.0.tgz#6a34653356635934a81baca68d0255432105dbef"
  integrity sha512-Dqk7LQKpwLoH3VovzZnkzegqNSuAziQyNZUcrdDM401iY+R5NkGBXGmtO05/yaXQziALuPogeG0b7UAgjnTJTQ==
  dependencies:
    boolbase "^1.0.0"
    css-what "^3.2.1"
    domutils "^1.7.0"
    nth-check "^1.0.2"

css-tree@1.0.0-alpha.37:
  version "1.0.0-alpha.37"
  resolved "https://registry.yarnpkg.com/css-tree/-/css-tree-1.0.0-alpha.37.tgz#98bebd62c4c1d9f960ec340cf9f7522e30709a22"
  integrity sha512-DMxWJg0rnz7UgxKT0Q1HU/L9BeJI0M6ksor0OgqOnF+aRCDWg/N2641HmVyU9KVIu0OVVWOb2IpC9A+BJRnejg==
  dependencies:
    mdn-data "2.0.4"
    source-map "^0.6.1"

css-what@2.1:
  version "2.1.3"
  resolved "https://registry.yarnpkg.com/css-what/-/css-what-2.1.3.tgz#a6d7604573365fe74686c3f311c56513d88285f2"
  integrity sha512-a+EPoD+uZiNfh+5fxw2nO9QwFa6nJe2Or35fGY6Ipw1R3R4AGz1d1TEZrCegvw2YTmZ0jXirGYlzxxpYSHwpEg==

css-what@^3.2.1:
  version "3.2.1"
  resolved "https://registry.yarnpkg.com/css-what/-/css-what-3.2.1.tgz#f4a8f12421064621b456755e34a03a2c22df5da1"
  integrity sha512-WwOrosiQTvyms+Ti5ZC5vGEK0Vod3FTt1ca+payZqvKuGJF+dq7bG63DstxtN0dpm6FxY27a/zS3Wten+gEtGw==

css.escape@^1.5.1:
  version "1.5.1"
  resolved "https://registry.yarnpkg.com/css.escape/-/css.escape-1.5.1.tgz#42e27d4fa04ae32f931a4b4d4191fa9cddee97cb"
  integrity sha1-QuJ9T6BK4y+TGktNQZH6nN3ul8s=

css@^2.0.0, css@^2.2.3:
  version "2.2.4"
  resolved "https://registry.yarnpkg.com/css/-/css-2.2.4.tgz#c646755c73971f2bba6a601e2cf2fd71b1298929"
  integrity sha512-oUnjmWpy0niI3x/mPL8dVEI1l7MnG3+HHyRPHf+YFSbK+svOhXpmSOcDURUh2aOCgl2grzrOPt1nHLuCVFULLw==
  dependencies:
    inherits "^2.0.3"
    source-map "^0.6.1"
    source-map-resolve "^0.5.2"
    urix "^0.1.0"

cssdb@^4.4.0:
  version "4.4.0"
  resolved "https://registry.yarnpkg.com/cssdb/-/cssdb-4.4.0.tgz#3bf2f2a68c10f5c6a08abd92378331ee803cddb0"
  integrity sha512-LsTAR1JPEM9TpGhl/0p3nQecC2LJ0kD8X5YARu1hk/9I1gril5vDtMZyNxcEpxxDj34YNck/ucjuoUd66K03oQ==

cssesc@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/cssesc/-/cssesc-2.0.0.tgz#3b13bd1bb1cb36e1bcb5a4dcd27f54c5dcb35703"
  integrity sha512-MsCAG1z9lPdoO/IUMLSBWBSVxVtJ1395VGIQ+Fc2gNdkQ1hNDnQdw3YhA71WJCBW1vdwA0cAnk/DnW6bqoEUYg==

cssesc@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/cssesc/-/cssesc-3.0.0.tgz#37741919903b868565e1c09ea747445cd18983ee"
  integrity sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==

cssnano-preset-default@^4.0.7:
  version "4.0.7"
  resolved "https://registry.yarnpkg.com/cssnano-preset-default/-/cssnano-preset-default-4.0.7.tgz#51ec662ccfca0f88b396dcd9679cdb931be17f76"
  integrity sha512-x0YHHx2h6p0fCl1zY9L9roD7rnlltugGu7zXSKQx6k2rYw0Hi3IqxcoAGF7u9Q5w1nt7vK0ulxV8Lo+EvllGsA==
  dependencies:
    css-declaration-sorter "^4.0.1"
    cssnano-util-raw-cache "^4.0.1"
    postcss "^7.0.0"
    postcss-calc "^7.0.1"
    postcss-colormin "^4.0.3"
    postcss-convert-values "^4.0.1"
    postcss-discard-comments "^4.0.2"
    postcss-discard-duplicates "^4.0.2"
    postcss-discard-empty "^4.0.1"
    postcss-discard-overridden "^4.0.1"
    postcss-merge-longhand "^4.0.11"
    postcss-merge-rules "^4.0.3"
    postcss-minify-font-values "^4.0.2"
    postcss-minify-gradients "^4.0.2"
    postcss-minify-params "^4.0.2"
    postcss-minify-selectors "^4.0.2"
    postcss-normalize-charset "^4.0.1"
    postcss-normalize-display-values "^4.0.2"
    postcss-normalize-positions "^4.0.2"
    postcss-normalize-repeat-style "^4.0.2"
    postcss-normalize-string "^4.0.2"
    postcss-normalize-timing-functions "^4.0.2"
    postcss-normalize-unicode "^4.0.1"
    postcss-normalize-url "^4.0.1"
    postcss-normalize-whitespace "^4.0.2"
    postcss-ordered-values "^4.1.2"
    postcss-reduce-initial "^4.0.3"
    postcss-reduce-transforms "^4.0.2"
    postcss-svgo "^4.0.2"
    postcss-unique-selectors "^4.0.1"

cssnano-util-get-arguments@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/cssnano-util-get-arguments/-/cssnano-util-get-arguments-4.0.0.tgz#ed3a08299f21d75741b20f3b81f194ed49cc150f"
  integrity sha1-7ToIKZ8h11dBsg87gfGU7UnMFQ8=

cssnano-util-get-match@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/cssnano-util-get-match/-/cssnano-util-get-match-4.0.0.tgz#c0e4ca07f5386bb17ec5e52250b4f5961365156d"
  integrity sha1-wOTKB/U4a7F+xeUiULT1lhNlFW0=

cssnano-util-raw-cache@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/cssnano-util-raw-cache/-/cssnano-util-raw-cache-4.0.1.tgz#b26d5fd5f72a11dfe7a7846fb4c67260f96bf282"
  integrity sha512-qLuYtWK2b2Dy55I8ZX3ky1Z16WYsx544Q0UWViebptpwn/xDBmog2TLg4f+DBMg1rJ6JDWtn96WHbOKDWt1WQA==
  dependencies:
    postcss "^7.0.0"

cssnano-util-same-parent@^4.0.0:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/cssnano-util-same-parent/-/cssnano-util-same-parent-4.0.1.tgz#574082fb2859d2db433855835d9a8456ea18bbf3"
  integrity sha512-WcKx5OY+KoSIAxBW6UBBRay1U6vkYheCdjyVNDm85zt5K9mHoGOfsOsqIszfAqrQQFIIKgjh2+FDgIj/zsl21Q==

cssnano@^4.1.10:
  version "4.1.10"
  resolved "https://registry.yarnpkg.com/cssnano/-/cssnano-4.1.10.tgz#0ac41f0b13d13d465487e111b778d42da631b8b2"
  integrity sha512-5wny+F6H4/8RgNlaqab4ktc3e0/blKutmq8yNlBFXA//nSFFAqAngjNVRzUvCgYROULmZZUoosL/KSoZo5aUaQ==
  dependencies:
    cosmiconfig "^5.0.0"
    cssnano-preset-default "^4.0.7"
    is-resolvable "^1.0.0"
    postcss "^7.0.0"

csso@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/csso/-/csso-4.0.2.tgz#e5f81ab3a56b8eefb7f0092ce7279329f454de3d"
  integrity sha512-kS7/oeNVXkHWxby5tHVxlhjizRCSv8QdU7hB2FpdAibDU8FjTAolhNjKNTiLzXtUrKT6HwClE81yXwEk1309wg==
  dependencies:
    css-tree "1.0.0-alpha.37"

cssom@0.3.x, "cssom@>= 0.3.2 < 0.4.0", cssom@^0.3.4:
  version "0.3.8"
  resolved "https://registry.yarnpkg.com/cssom/-/cssom-0.3.8.tgz#9f1276f5b2b463f2114d3f2c75250af8c1a36f4a"
  integrity sha512-b0tGHbfegbhPJpxpiBPU2sCkigAqtM9O121le6bbOlgyV+NyGyCmVfJ6QW9eRjz8CpNfWEOYBIMIGRYkLwsIYg==

cssstyle@^1.0.0, cssstyle@^1.1.1:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/cssstyle/-/cssstyle-1.4.0.tgz#9d31328229d3c565c61e586b02041a28fccdccf1"
  integrity sha512-GBrLZYZ4X4x6/QEoBnIrqb8B/f5l4+8me2dkom/j1Gtbxy0kBv6OGzKuAsGM75bkGwGAFkt56Iwg28S3XTZgSA==
  dependencies:
    cssom "0.3.x"

csstype@^2.2.0:
  version "2.6.10"
  resolved "https://registry.yarnpkg.com/csstype/-/csstype-2.6.10.tgz#e63af50e66d7c266edb6b32909cfd0aabe03928b"
  integrity sha512-D34BqZU4cIlMCY93rZHbrq9pjTAQJ3U8S8rfBqjwHxkGPThWFjzZDQpgMJY0QViLxth6ZKYiwFBo14RdN44U/w==

cyclist@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/cyclist/-/cyclist-1.0.1.tgz#596e9698fd0c80e12038c2b82d6eb1b35b6224d9"
  integrity sha1-WW6WmP0MgOEgOMK4LW6xs1tiJNk=

d@1, d@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/d/-/d-1.0.1.tgz#8698095372d58dbee346ffd0c7093f99f8f9eb5a"
  integrity sha512-m62ShEObQ39CfralilEQRjH6oAMtNCV1xJyEx5LpRYUVN+EviphDgUc/F3hnYbADmkiNs67Y+3ylmlG7Lnu+FA==
  dependencies:
    es5-ext "^0.10.50"
    type "^1.0.1"

damerau-levenshtein@^1.0.4:
  version "1.0.6"
  resolved "https://registry.yarnpkg.com/damerau-levenshtein/-/damerau-levenshtein-1.0.6.tgz#143c1641cb3d85c60c32329e26899adea8701791"
  integrity sha512-JVrozIeElnj3QzfUIt8tB8YMluBJom4Vw9qTPpjGYQ9fYlB3D/rb6OordUxf3xeFB35LKWs0xqcO5U6ySvBtug==

dashdash@^1.12.0:
  version "1.14.1"
  resolved "https://registry.yarnpkg.com/dashdash/-/dashdash-1.14.1.tgz#853cfa0f7cbe2fed5de20326b8dd581035f6e2f0"
  integrity sha1-hTz6D3y+L+1d4gMmuN1YEDX24vA=
  dependencies:
    assert-plus "^1.0.0"

data-urls@^1.0.0, data-urls@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/data-urls/-/data-urls-1.1.0.tgz#15ee0582baa5e22bb59c77140da8f9c76963bbfe"
  integrity sha512-YTWYI9se1P55u58gL5GkQHW4P6VJBJ5iBT+B5a7i2Tjadhv52paJG0qHX4A0OR6/t52odI64KP2YvFpkDOi3eQ==
  dependencies:
    abab "^2.0.0"
    whatwg-mimetype "^2.2.0"
    whatwg-url "^7.0.0"

debug@2.6.9, debug@^2.2.0, debug@^2.3.3, debug@^2.6.0, debug@^2.6.9:
  version "2.6.9"
  resolved "https://registry.yarnpkg.com/debug/-/debug-2.6.9.tgz#5d128515df134ff327e90a4c93f4e077a536341f"
  integrity sha512-bC7ElrdJaJnPbAP+1EotYvqZsb3ecl5wi6Bfi6BJTUcNowp6cvspg0jXznRTKDjm/E7AdgFBVeAPVMNcKGsHMA==
  dependencies:
    ms "2.0.0"

debug@^3.0.0, debug@^3.1.1, debug@^3.2.5:
  version "3.2.6"
  resolved "https://registry.yarnpkg.com/debug/-/debug-3.2.6.tgz#e83d17de16d8a7efb7717edbe5fb10135eee629b"
  integrity sha512-mel+jf7nrtEl5Pn1Qx46zARXKDpBbvzezse7p7LqINmdoIk8PYP5SySaxEmYv6TZ0JyEKA1hsCId6DIhgITtWQ==
  dependencies:
    ms "^2.1.1"

debug@^4.0.1, debug@^4.1.0, debug@^4.1.1:
  version "4.1.1"
  resolved "https://registry.yarnpkg.com/debug/-/debug-4.1.1.tgz#3b72260255109c6b589cee050f1d516139664791"
  integrity sha512-pYAIzeRo8J6KPEaJ0VWOh5Pzkbw/RetuzehGM7QRRX5he4fPHx2rdKMB256ehJCkX+XRQm16eZLqLNS8RSZXZw==
  dependencies:
    ms "^2.1.1"

decamelize@^1.2.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/decamelize/-/decamelize-1.2.0.tgz#f6534d15148269b20352e7bee26f501f9a191290"
  integrity sha1-9lNNFRSCabIDUue+4m9QH5oZEpA=

decode-uri-component@^0.2.0:
  version "0.2.0"
  resolved "https://registry.yarnpkg.com/decode-uri-component/-/decode-uri-component-0.2.0.tgz#eb3913333458775cb84cd1a1fae062106bb87545"
  integrity sha1-6zkTMzRYd1y4TNGh+uBiEGu4dUU=

deep-equal@^1.0.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/deep-equal/-/deep-equal-1.1.1.tgz#b5c98c942ceffaf7cb051e24e1434a25a2e6076a"
  integrity sha512-yd9c5AdiqVcR+JjcwUQb9DkhJc8ngNr0MahEBGvDiJw8puWab2yZlh+nkasOnZP+EGTAP6rRp2JzJhJZzvNF8g==
  dependencies:
    is-arguments "^1.0.4"
    is-date-object "^1.0.1"
    is-regex "^1.0.4"
    object-is "^1.0.1"
    object-keys "^1.1.1"
    regexp.prototype.flags "^1.2.0"

deep-is@~0.1.3:
  version "0.1.3"
  resolved "https://registry.yarnpkg.com/deep-is/-/deep-is-0.1.3.tgz#b369d6fb5dbc13eecf524f91b070feedc357cf34"
  integrity sha1-s2nW+128E+7PUk+RsHD+7cNXzzQ=

default-gateway@^4.2.0:
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/default-gateway/-/default-gateway-4.2.0.tgz#167104c7500c2115f6dd69b0a536bb8ed720552b"
  integrity sha512-h6sMrVB1VMWVrW13mSc6ia/DwYYw5MN6+exNu1OaJeFac5aSAvwM7lZ0NVfTABuSkQelr4h5oebg3KB1XPdjgA==
  dependencies:
    execa "^1.0.0"
    ip-regex "^2.1.0"

define-properties@^1.1.2, define-properties@^1.1.3:
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/define-properties/-/define-properties-1.1.3.tgz#cf88da6cbee26fe6db7094f61d870cbd84cee9f1"
  integrity sha512-3MqfYKj2lLzdMSf8ZIZE/V+Zuy+BgD6f164e8K2w7dgnpKArBDerGYpM46IYYcjnkdPNMjPk9A6VFB8+3SKlXQ==
  dependencies:
    object-keys "^1.0.12"

define-property@^0.2.5:
  version "0.2.5"
  resolved "https://registry.yarnpkg.com/define-property/-/define-property-0.2.5.tgz#c35b1ef918ec3c990f9a5bc57be04aacec5c8116"
  integrity sha1-w1se+RjsPJkPmlvFe+BKrOxcgRY=
  dependencies:
    is-descriptor "^0.1.0"

define-property@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/define-property/-/define-property-1.0.0.tgz#769ebaaf3f4a63aad3af9e8d304c9bbe79bfb0e6"
  integrity sha1-dp66rz9KY6rTr56NMEybvnm/sOY=
  dependencies:
    is-descriptor "^1.0.0"

define-property@^2.0.2:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/define-property/-/define-property-2.0.2.tgz#d459689e8d654ba77e02a817f8710d702cb16e9d"
  integrity sha512-jwK2UV4cnPpbcG7+VRARKTZPUWowwXA8bzH5NP6ud0oeAxyYPuGZUAC7hMugpCdz4BeSZl2Dl9k66CHJ/46ZYQ==
  dependencies:
    is-descriptor "^1.0.2"
    isobject "^3.0.1"

del@^4.1.1:
  version "4.1.1"
  resolved "https://registry.yarnpkg.com/del/-/del-4.1.1.tgz#9e8f117222ea44a31ff3a156c049b99052a9f0b4"
  integrity sha512-QwGuEUouP2kVwQenAsOof5Fv8K9t3D8Ca8NxcXKrIpEHjTXK5J2nXLdP+ALI1cgv8wj7KuwBhTwBkOZSJKM5XQ==
  dependencies:
    "@types/glob" "^7.1.1"
    globby "^6.1.0"
    is-path-cwd "^2.0.0"
    is-path-in-cwd "^2.0.0"
    p-map "^2.0.0"
    pify "^4.0.1"
    rimraf "^2.6.3"

delayed-stream@~1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/delayed-stream/-/delayed-stream-1.0.0.tgz#df3ae199acadfb7d440aaae0b29e2272b24ec619"
  integrity sha1-3zrhmayt+31ECqrgsp4icrJOxhk=

depd@~1.1.2:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/depd/-/depd-1.1.2.tgz#9bcd52e14c097763e749b274c4346ed2e560b5a9"
  integrity sha1-m81S4UwJd2PnSbJ0xDRu0uVgtak=

des.js@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/des.js/-/des.js-1.0.1.tgz#5382142e1bdc53f85d86d53e5f4aa7deb91e0843"
  integrity sha512-Q0I4pfFrv2VPd34/vfLrFOoRmlYj3OV50i7fskps1jZWK1kApMWWT9G6RRUeYedLcBDIhnSDaUvJMb3AhUlaEA==
  dependencies:
    inherits "^2.0.1"
    minimalistic-assert "^1.0.0"

destroy@~1.0.4:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/destroy/-/destroy-1.0.4.tgz#978857442c44749e4206613e37946205826abd80"
  integrity sha1-l4hXRCxEdJ5CBmE+N5RiBYJqvYA=

detect-newline@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/detect-newline/-/detect-newline-2.1.0.tgz#f41f1c10be4b00e87b5f13da680759f2c5bfd3e2"
  integrity sha1-9B8cEL5LAOh7XxPaaAdZ8sW/0+I=

detect-node@^2.0.4:
  version "2.0.4"
  resolved "https://registry.yarnpkg.com/detect-node/-/detect-node-2.0.4.tgz#014ee8f8f669c5c58023da64b8179c083a28c46c"
  integrity sha512-ZIzRpLJrOj7jjP2miAtgqIfmzbxa4ZOr5jJc601zklsfEx9oTzmmj2nVpIPRpNlRTIh8lc1kyViIY7BWSGNmKw==

detect-port-alt@1.1.6:
  version "1.1.6"
  resolved "https://registry.yarnpkg.com/detect-port-alt/-/detect-port-alt-1.1.6.tgz#24707deabe932d4a3cf621302027c2b266568275"
  integrity sha512-5tQykt+LqfJFBEYaDITx7S7cR7mJ/zQmLXZ2qt5w04ainYZw6tBf9dBunMjVeVOdYVRUzUOE4HkY5J7+uttb5Q==
  dependencies:
    address "^1.0.1"
    debug "^2.6.0"

diff-sequences@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/diff-sequences/-/diff-sequences-24.9.0.tgz#5715d6244e2aa65f48bba0bc972db0b0b11e95b5"
  integrity sha512-Dj6Wk3tWyTE+Fo1rW8v0Xhwk80um6yFYKbuAxc9c3EZxIHFDYwbi34Uk42u1CdnIiVorvt4RmlSDjIPyzGC2ew==

diffie-hellman@^5.0.0:
  version "5.0.3"
  resolved "https://registry.yarnpkg.com/diffie-hellman/-/diffie-hellman-5.0.3.tgz#40e8ee98f55a2149607146921c63e1ae5f3d2875"
  integrity sha512-kqag/Nl+f3GwyK25fhUMYj81BUOrZ9IuJsjIcDE5icNM9FJHAVm3VcUDxdLPoQtTuUylWm6ZIknYJwwaPxsUzg==
  dependencies:
    bn.js "^4.1.0"
    miller-rabin "^4.0.0"
    randombytes "^2.0.0"

dir-glob@2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/dir-glob/-/dir-glob-2.0.0.tgz#0b205d2b6aef98238ca286598a8204d29d0a0034"
  integrity sha512-37qirFDz8cA5fimp9feo43fSuRo2gHwaIn6dXL8Ber1dGwUosDrGZeCCXq57WnIqE4aQ+u3eQZzsk1yOzhdwag==
  dependencies:
    arrify "^1.0.1"
    path-type "^3.0.0"

dns-equal@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/dns-equal/-/dns-equal-1.0.0.tgz#b39e7f1da6eb0a75ba9c17324b34753c47e0654d"
  integrity sha1-s55/HabrCnW6nBcySzR1PEfgZU0=

dns-packet@^1.3.1:
  version "1.3.1"
  resolved "https://registry.yarnpkg.com/dns-packet/-/dns-packet-1.3.1.tgz#12aa426981075be500b910eedcd0b47dd7deda5a"
  integrity sha512-0UxfQkMhYAUaZI+xrNZOz/as5KgDU0M/fQ9b6SpkyLbk3GEswDi6PADJVaYJradtRVsRIlF1zLyOodbcTCDzUg==
  dependencies:
    ip "^1.1.0"
    safe-buffer "^5.0.1"

dns-txt@^2.0.2:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/dns-txt/-/dns-txt-2.0.2.tgz#b91d806f5d27188e4ab3e7d107d881a1cc4642b6"
  integrity sha1-uR2Ab10nGI5Ks+fRB9iBocxGQrY=
  dependencies:
    buffer-indexof "^1.0.0"

doctrine@1.5.0:
  version "1.5.0"
  resolved "https://registry.yarnpkg.com/doctrine/-/doctrine-1.5.0.tgz#379dce730f6166f76cefa4e6707a159b02c5a6fa"
  integrity sha1-N53Ocw9hZvds76TmcHoVmwLFpvo=
  dependencies:
    esutils "^2.0.2"
    isarray "^1.0.0"

doctrine@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/doctrine/-/doctrine-2.1.0.tgz#5cd01fc101621b42c4cd7f5d1a66243716d3f39d"
  integrity sha512-35mSku4ZXK0vfCuHEDAwt55dg2jNajHZ1odvF+8SSr82EsZY4QmXfuWso8oEd8zRhVObSN18aM0CjSdoBX7zIw==
  dependencies:
    esutils "^2.0.2"

doctrine@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/doctrine/-/doctrine-3.0.0.tgz#addebead72a6574db783639dc87a121773973961"
  integrity sha512-yS+Q5i3hBf7GBkd4KG8a7eBNNWNGLTaEwwYWUijIYM7zrlYDM0BFXHjjPWlWZ1Rg7UaddZeIDmi9jF3HmqiQ2w==
  dependencies:
    esutils "^2.0.2"

dom-accessibility-api@^0.3.0:
  version "0.3.0"
  resolved "https://registry.yarnpkg.com/dom-accessibility-api/-/dom-accessibility-api-0.3.0.tgz#511e5993dd673b97c87ea47dba0e3892f7e0c983"
  integrity sha512-PzwHEmsRP3IGY4gv/Ug+rMeaTIyTJvadCb+ujYXYeIylbHJezIyNToe8KfEgHTCEYyC+/bUghYOGg8yMGlZ6vA==

dom-converter@^0.2:
  version "0.2.0"
  resolved "https://registry.yarnpkg.com/dom-converter/-/dom-converter-0.2.0.tgz#6721a9daee2e293682955b6afe416771627bb768"
  integrity sha512-gd3ypIPfOMr9h5jIKq8E3sHOTCjeirnl0WK5ZdS1AW0Odt0b1PaWaHdJ4Qk4klv+YB9aJBS7mESXjFoDQPu6DA==
  dependencies:
    utila "~0.4"

dom-serializer@0:
  version "0.2.2"
  resolved "https://registry.yarnpkg.com/dom-serializer/-/dom-serializer-0.2.2.tgz#1afb81f533717175d478655debc5e332d9f9bb51"
  integrity sha512-2/xPb3ORsQ42nHYiSunXkDjPLBaEj/xTwUO4B7XCZQTRk7EBtTOPaygh10YAAh2OI1Qrp6NWfpAhzswj0ydt9g==
  dependencies:
    domelementtype "^2.0.1"
    entities "^2.0.0"

domain-browser@^1.1.1:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/domain-browser/-/domain-browser-1.2.0.tgz#3d31f50191a6749dd1375a7f522e823d42e54eda"
  integrity sha512-jnjyiM6eRyZl2H+W8Q/zLMA481hzi0eszAaBUzIVnmYVDBbnLxVNnfu1HgEBvCbL+71FrxMl3E6lpKH7Ge3OXA==

domelementtype@1, domelementtype@^1.3.1:
  version "1.3.1"
  resolved "https://registry.yarnpkg.com/domelementtype/-/domelementtype-1.3.1.tgz#d048c44b37b0d10a7f2a3d5fee3f4333d790481f"
  integrity sha512-BSKB+TSpMpFI/HOxCNr1O8aMOTZ8hT3pM3GQ0w/mWRmkhEDSFJkkyzz4XQsBV44BChwGkrDfMyjVD0eA2aFV3w==

domelementtype@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/domelementtype/-/domelementtype-2.0.1.tgz#1f8bdfe91f5a78063274e803b4bdcedf6e94f94d"
  integrity sha512-5HOHUDsYZWV8FGWN0Njbr/Rn7f/eWSQi1v7+HsUVwXgn8nWWlL64zKDkS0n8ZmQ3mlWOMuXOnR+7Nx/5tMO5AQ==

domexception@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/domexception/-/domexception-1.0.1.tgz#937442644ca6a31261ef36e3ec677fe805582c90"
  integrity sha512-raigMkn7CJNNo6Ihro1fzG7wr3fHuYVytzquZKX5n0yizGsTcYgzdIUwj1X9pK0VvjeihV+XiclP+DjwbsSKug==
  dependencies:
    webidl-conversions "^4.0.2"

domhandler@^2.3.0:
  version "2.4.2"
  resolved "https://registry.yarnpkg.com/domhandler/-/domhandler-2.4.2.tgz#8805097e933d65e85546f726d60f5eb88b44f803"
  integrity sha512-JiK04h0Ht5u/80fdLMCEmV4zkNh2BcoMFBmZ/91WtYZ8qVXSKjiw7fXMgFPnHcSZgOo3XdinHvmnDUeMf5R4wA==
  dependencies:
    domelementtype "1"

domutils@1.5.1:
  version "1.5.1"
  resolved "https://registry.yarnpkg.com/domutils/-/domutils-1.5.1.tgz#dcd8488a26f563d61079e48c9f7b7e32373682cf"
  integrity sha1-3NhIiib1Y9YQeeSMn3t+Mjc2gs8=
  dependencies:
    dom-serializer "0"
    domelementtype "1"

domutils@^1.5.1, domutils@^1.7.0:
  version "1.7.0"
  resolved "https://registry.yarnpkg.com/domutils/-/domutils-1.7.0.tgz#56ea341e834e06e6748af7a1cb25da67ea9f8c2a"
  integrity sha512-Lgd2XcJ/NjEw+7tFvfKxOzCYKZsdct5lczQ2ZaQY8Djz7pfAD3Gbp8ySJWtreII/vDlMVmxwa6pHmdxIYgttDg==
  dependencies:
    dom-serializer "0"
    domelementtype "1"

dot-case@^3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/dot-case/-/dot-case-3.0.3.tgz#21d3b52efaaba2ea5fda875bb1aa8124521cf4aa"
  integrity sha512-7hwEmg6RiSQfm/GwPL4AAWXKy3YNNZA3oFv2Pdiey0mwkRCPZ9x6SZbkLcn8Ma5PYeVokzoD4Twv2n7LKp5WeA==
  dependencies:
    no-case "^3.0.3"
    tslib "^1.10.0"

dot-prop@^5.2.0:
  version "5.2.0"
  resolved "https://registry.yarnpkg.com/dot-prop/-/dot-prop-5.2.0.tgz#c34ecc29556dc45f1f4c22697b6f4904e0cc4fcb"
  integrity sha512-uEUyaDKoSQ1M4Oq8l45hSE26SnTxL6snNnqvK/VWx5wJhmff5z0FUVJDKDanor/6w3kzE3i7XZOk+7wC0EXr1A==
  dependencies:
    is-obj "^2.0.0"

dotenv-expand@5.1.0:
  version "5.1.0"
  resolved "https://registry.yarnpkg.com/dotenv-expand/-/dotenv-expand-5.1.0.tgz#3fbaf020bfd794884072ea26b1e9791d45a629f0"
  integrity sha512-YXQl1DSa4/PQyRfgrv6aoNjhasp/p4qs9FjJ4q4cQk+8m4r6k4ZSiEyytKG8f8W9gi8WsQtIObNmKd+tMzNTmA==

dotenv@8.2.0:
  version "8.2.0"
  resolved "https://registry.yarnpkg.com/dotenv/-/dotenv-8.2.0.tgz#97e619259ada750eea3e4ea3e26bceea5424b16a"
  integrity sha512-8sJ78ElpbDJBHNeBzUbUVLsqKdccaa/BXF1uPTw3GrvQTBgrQrtObr2mUrE38vzYd8cEv+m/JBfDLioYcfXoaw==

duplexer@^0.1.1:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/duplexer/-/duplexer-0.1.1.tgz#ace6ff808c1ce66b57d1ebf97977acb02334cfc1"
  integrity sha1-rOb/gIwc5mtX0ev5eXessCM0z8E=

duplexify@^3.4.2, duplexify@^3.6.0:
  version "3.7.1"
  resolved "https://registry.yarnpkg.com/duplexify/-/duplexify-3.7.1.tgz#2a4df5317f6ccfd91f86d6fd25d8d8a103b88309"
  integrity sha512-07z8uv2wMyS51kKhD1KsdXJg5WQ6t93RneqRxUHnskXVtlYYkLqM0gqStQZ3pj073g687jPCHrqNfCzawLYh5g==
  dependencies:
    end-of-stream "^1.0.0"
    inherits "^2.0.1"
    readable-stream "^2.0.0"
    stream-shift "^1.0.0"

ecc-jsbn@~0.1.1:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/ecc-jsbn/-/ecc-jsbn-0.1.2.tgz#3a83a904e54353287874c564b7549386849a98c9"
  integrity sha1-OoOpBOVDUyh4dMVkt1SThoSamMk=
  dependencies:
    jsbn "~0.1.0"
    safer-buffer "^2.1.0"

ee-first@1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/ee-first/-/ee-first-1.1.1.tgz#590c61156b0ae2f4f0255732a158b266bc56b21d"
  integrity sha1-WQxhFWsK4vTwJVcyoViyZrxWsh0=

electron-to-chromium@^1.3.378:
  version "1.3.379"
  resolved "https://registry.yarnpkg.com/electron-to-chromium/-/electron-to-chromium-1.3.379.tgz#81dc5e82a3e72bbb830d93e15bc35eda2bbc910e"
  integrity sha512-NK9DBBYEBb5f9D7zXI0hiE941gq3wkBeQmXs1ingigA/jnTg5mhwY2Z5egwA+ZI8OLGKCx0h1Cl8/xeuIBuLlg==

elliptic@^6.0.0:
  version "6.5.2"
  resolved "https://registry.yarnpkg.com/elliptic/-/elliptic-6.5.2.tgz#05c5678d7173c049d8ca433552224a495d0e3762"
  integrity sha512-f4x70okzZbIQl/NSRLkI/+tteV/9WqL98zx+SQ69KbXxmVrmjwsNUPn/gYJJ0sHvEak24cZgHIPegRePAtA/xw==
  dependencies:
    bn.js "^4.4.0"
    brorand "^1.0.1"
    hash.js "^1.0.0"
    hmac-drbg "^1.0.0"
    inherits "^2.0.1"
    minimalistic-assert "^1.0.0"
    minimalistic-crypto-utils "^1.0.0"

emoji-regex@^7.0.1, emoji-regex@^7.0.2:
  version "7.0.3"
  resolved "https://registry.yarnpkg.com/emoji-regex/-/emoji-regex-7.0.3.tgz#933a04052860c85e83c122479c4748a8e4c72156"
  integrity sha512-CwBLREIQ7LvYFB0WyRvwhq5N5qPhc6PMjD6bYggFlI5YyDgl+0vxq5VHbMOFqLg7hfWzmu8T5Z1QofhmTIhItA==

emoji-regex@^8.0.0:
  version "8.0.0"
  resolved "https://registry.yarnpkg.com/emoji-regex/-/emoji-regex-8.0.0.tgz#e818fd69ce5ccfcb404594f842963bf53164cc37"
  integrity sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A==

emojis-list@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/emojis-list/-/emojis-list-2.1.0.tgz#4daa4d9db00f9819880c79fa457ae5b09a1fd389"
  integrity sha1-TapNnbAPmBmIDHn6RXrlsJof04k=

emojis-list@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/emojis-list/-/emojis-list-3.0.0.tgz#5570662046ad29e2e916e71aae260abdff4f6a78"
  integrity sha512-/kyM18EfinwXZbno9FyUGeFh87KC8HRQBQGildHZbEuRyWFOmv1U10o9BBp8XVZDVNNuQKyIGIu5ZYAAXJ0V2Q==

encodeurl@~1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/encodeurl/-/encodeurl-1.0.2.tgz#ad3ff4c86ec2d029322f5a02c3a9a606c95b3f59"
  integrity sha1-rT/0yG7C0CkyL1oCw6mmBslbP1k=

end-of-stream@^1.0.0, end-of-stream@^1.1.0:
  version "1.4.4"
  resolved "https://registry.yarnpkg.com/end-of-stream/-/end-of-stream-1.4.4.tgz#5ae64a5f45057baf3626ec14da0ca5e4b2431eb0"
  integrity sha512-+uw1inIHVPQoaVuHzRyXd21icM+cnt4CzD5rW+NC1wjOUSTOs+Te7FOv7AhN7vS9x/oIyhLP5PR1H+phQAHu5Q==
  dependencies:
    once "^1.4.0"

enhanced-resolve@^4.1.0:
  version "4.1.1"
  resolved "https://registry.yarnpkg.com/enhanced-resolve/-/enhanced-resolve-4.1.1.tgz#2937e2b8066cd0fe7ce0990a98f0d71a35189f66"
  integrity sha512-98p2zE+rL7/g/DzMHMTF4zZlCgeVdJ7yr6xzEpJRYwFYrGi9ANdn5DnJURg6RpBkyk60XYDnWIv51VfIhfNGuA==
  dependencies:
    graceful-fs "^4.1.2"
    memory-fs "^0.5.0"
    tapable "^1.0.0"

entities@^1.1.1:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/entities/-/entities-1.1.2.tgz#bdfa735299664dfafd34529ed4f8522a275fea56"
  integrity sha512-f2LZMYl1Fzu7YSBKg+RoROelpOaNrcGmE9AZubeDfrCEia483oW4MI4VyFd5VNHIgQ/7qm1I0wUHK1eJnn2y2w==

entities@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/entities/-/entities-2.0.0.tgz#68d6084cab1b079767540d80e56a39b423e4abf4"
  integrity sha512-D9f7V0JSRwIxlRI2mjMqufDrRDnx8p+eEOz7aUM9SuvF8gsBzra0/6tbjl1m8eQHrZlYj6PxqE00hZ1SAIKPLw==

errno@^0.1.3, errno@~0.1.7:
  version "0.1.7"
  resolved "https://registry.yarnpkg.com/errno/-/errno-0.1.7.tgz#4684d71779ad39af177e3f007996f7c67c852618"
  integrity sha512-MfrRBDWzIWifgq6tJj60gkAwtLNb6sQPlcFrSOflcP1aFmmruKQ2wRnze/8V6kgyz7H3FF8Npzv78mZ7XLLflg==
  dependencies:
    prr "~1.0.1"

error-ex@^1.2.0, error-ex@^1.3.1:
  version "1.3.2"
  resolved "https://registry.yarnpkg.com/error-ex/-/error-ex-1.3.2.tgz#b4ac40648107fdcdcfae242f428bea8a14d4f1bf"
  integrity sha512-7dFHNmqeFSEt2ZBsCriorKnn3Z2pj+fd9kmI6QoWw4//DL+icEBfc0U7qJCisqrTsKTjw4fNFy2pW9OqStD84g==
  dependencies:
    is-arrayish "^0.2.1"

es-abstract@^1.17.0, es-abstract@^1.17.0-next.1, es-abstract@^1.17.2:
  version "1.17.4"
  resolved "https://registry.yarnpkg.com/es-abstract/-/es-abstract-1.17.4.tgz#e3aedf19706b20e7c2594c35fc0d57605a79e184"
  integrity sha512-Ae3um/gb8F0mui/jPL+QiqmglkUsaQf7FwBEHYIFkztkneosu9imhqHpBzQ3h1vit8t5iQ74t6PEVvphBZiuiQ==
  dependencies:
    es-to-primitive "^1.2.1"
    function-bind "^1.1.1"
    has "^1.0.3"
    has-symbols "^1.0.1"
    is-callable "^1.1.5"
    is-regex "^1.0.5"
    object-inspect "^1.7.0"
    object-keys "^1.1.1"
    object.assign "^4.1.0"
    string.prototype.trimleft "^2.1.1"
    string.prototype.trimright "^2.1.1"

es-to-primitive@^1.2.1:
  version "1.2.1"
  resolved "https://registry.yarnpkg.com/es-to-primitive/-/es-to-primitive-1.2.1.tgz#e55cd4c9cdc188bcefb03b366c736323fc5c898a"
  integrity sha512-QCOllgZJtaUo9miYBcLChTUaHNjJF3PYs1VidD7AwiEj1kYxKeQTctLAezAOH5ZKRH0g2IgPn6KwB4IT8iRpvA==
  dependencies:
    is-callable "^1.1.4"
    is-date-object "^1.0.1"
    is-symbol "^1.0.2"

es5-ext@^0.10.35, es5-ext@^0.10.50:
  version "0.10.53"
  resolved "https://registry.yarnpkg.com/es5-ext/-/es5-ext-0.10.53.tgz#93c5a3acfdbef275220ad72644ad02ee18368de1"
  integrity sha512-Xs2Stw6NiNHWypzRTY1MtaG/uJlwCk8kH81920ma8mvN8Xq1gsfhZvpkImLQArw8AHnv8MT2I45J3c0R8slE+Q==
  dependencies:
    es6-iterator "~2.0.3"
    es6-symbol "~3.1.3"
    next-tick "~1.0.0"

es6-iterator@2.0.3, es6-iterator@~2.0.3:
  version "2.0.3"
  resolved "https://registry.yarnpkg.com/es6-iterator/-/es6-iterator-2.0.3.tgz#a7de889141a05a94b0854403b2d0a0fbfa98f3b7"
  integrity sha1-p96IkUGgWpSwhUQDstCg+/qY87c=
  dependencies:
    d "1"
    es5-ext "^0.10.35"
    es6-symbol "^3.1.1"

es6-symbol@^3.1.1, es6-symbol@~3.1.3:
  version "3.1.3"
  resolved "https://registry.yarnpkg.com/es6-symbol/-/es6-symbol-3.1.3.tgz#bad5d3c1bcdac28269f4cb331e431c78ac705d18"
  integrity sha512-NJ6Yn3FuDinBaBRWl/q5X/s4koRHBrgKAu+yGI6JCBeiu3qrcbJhwT2GeR/EXVfylRk8dpQVJoLEFhK+Mu31NA==
  dependencies:
    d "^1.0.1"
    ext "^1.1.2"

escape-html@~1.0.3:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/escape-html/-/escape-html-1.0.3.tgz#0258eae4d3d0c0974de1c169188ef0051d1d1988"
  integrity sha1-Aljq5NPQwJdN4cFpGI7wBR0dGYg=

escape-string-regexp@2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/escape-string-regexp/-/escape-string-regexp-2.0.0.tgz#a30304e99daa32e23b2fd20f51babd07cffca344"
  integrity sha512-UpzcLCXolUWcNu5HtVMHYdXJjArjsF9C0aNnquZYY4uW/Vu0miy5YoWvbV345HauVvcAUnpRuhMMcqTcGOY2+w==

escape-string-regexp@^1.0.2, escape-string-regexp@^1.0.5:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/escape-string-regexp/-/escape-string-regexp-1.0.5.tgz#1b61c0562190a8dff6ae3bb2cf0200ca130b86d4"
  integrity sha1-G2HAViGQqN/2rjuyzwIAyhMLhtQ=

escodegen@^1.11.0, escodegen@^1.9.1:
  version "1.14.1"
  resolved "https://registry.yarnpkg.com/escodegen/-/escodegen-1.14.1.tgz#ba01d0c8278b5e95a9a45350142026659027a457"
  integrity sha512-Bmt7NcRySdIfNPfU2ZoXDrrXsG9ZjvDxcAlMfDUgRBjLOWTuIACXPBFJH7Z+cLb40JeQco5toikyc9t9P8E9SQ==
  dependencies:
    esprima "^4.0.1"
    estraverse "^4.2.0"
    esutils "^2.0.2"
    optionator "^0.8.1"
  optionalDependencies:
    source-map "~0.6.1"

eslint-config-react-app@^5.2.1:
  version "5.2.1"
  resolved "https://registry.yarnpkg.com/eslint-config-react-app/-/eslint-config-react-app-5.2.1.tgz#698bf7aeee27f0cea0139eaef261c7bf7dd623df"
  integrity sha512-pGIZ8t0mFLcV+6ZirRgYK6RVqUIKRIi9MmgzUEmrIknsn3AdO0I32asO86dJgloHq+9ZPl8UIg8mYrvgP5u2wQ==
  dependencies:
    confusing-browser-globals "^1.0.9"

eslint-import-resolver-node@^0.3.2:
  version "0.3.3"
  resolved "https://registry.yarnpkg.com/eslint-import-resolver-node/-/eslint-import-resolver-node-0.3.3.tgz#dbaa52b6b2816b50bc6711af75422de808e98404"
  integrity sha512-b8crLDo0M5RSe5YG8Pu2DYBj71tSB6OvXkfzwbJU2w7y8P4/yo0MyF8jU26IEuEuHF2K5/gcAJE3LhQGqBBbVg==
  dependencies:
    debug "^2.6.9"
    resolve "^1.13.1"

eslint-loader@3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/eslint-loader/-/eslint-loader-3.0.3.tgz#e018e3d2722381d982b1201adb56819c73b480ca"
  integrity sha512-+YRqB95PnNvxNp1HEjQmvf9KNvCin5HXYYseOXVC2U0KEcw4IkQ2IQEBG46j7+gW39bMzeu0GsUhVbBY3Votpw==
  dependencies:
    fs-extra "^8.1.0"
    loader-fs-cache "^1.0.2"
    loader-utils "^1.2.3"
    object-hash "^2.0.1"
    schema-utils "^2.6.1"

eslint-module-utils@^2.4.1:
  version "2.5.2"
  resolved "https://registry.yarnpkg.com/eslint-module-utils/-/eslint-module-utils-2.5.2.tgz#7878f7504824e1b857dd2505b59a8e5eda26a708"
  integrity sha512-LGScZ/JSlqGKiT8OC+cYRxseMjyqt6QO54nl281CK93unD89ijSeRV6An8Ci/2nvWVKe8K/Tqdm75RQoIOCr+Q==
  dependencies:
    debug "^2.6.9"
    pkg-dir "^2.0.0"

eslint-plugin-flowtype@4.6.0:
  version "4.6.0"
  resolved "https://registry.yarnpkg.com/eslint-plugin-flowtype/-/eslint-plugin-flowtype-4.6.0.tgz#82b2bd6f21770e0e5deede0228e456cb35308451"
  integrity sha512-W5hLjpFfZyZsXfo5anlu7HM970JBDqbEshAJUkeczP6BFCIfJXuiIBQXyberLRtOStT0OGPF8efeTbxlHk4LpQ==
  dependencies:
    lodash "^4.17.15"

eslint-plugin-import@2.20.1:
  version "2.20.1"
  resolved "https://registry.yarnpkg.com/eslint-plugin-import/-/eslint-plugin-import-2.20.1.tgz#802423196dcb11d9ce8435a5fc02a6d3b46939b3"
  integrity sha512-qQHgFOTjguR+LnYRoToeZWT62XM55MBVXObHM6SKFd1VzDcX/vqT1kAz8ssqigh5eMj8qXcRoXXGZpPP6RfdCw==
  dependencies:
    array-includes "^3.0.3"
    array.prototype.flat "^1.2.1"
    contains-path "^0.1.0"
    debug "^2.6.9"
    doctrine "1.5.0"
    eslint-import-resolver-node "^0.3.2"
    eslint-module-utils "^2.4.1"
    has "^1.0.3"
    minimatch "^3.0.4"
    object.values "^1.1.0"
    read-pkg-up "^2.0.0"
    resolve "^1.12.0"

eslint-plugin-jsx-a11y@6.2.3:
  version "6.2.3"
  resolved "https://registry.yarnpkg.com/eslint-plugin-jsx-a11y/-/eslint-plugin-jsx-a11y-6.2.3.tgz#b872a09d5de51af70a97db1eea7dc933043708aa"
  integrity sha512-CawzfGt9w83tyuVekn0GDPU9ytYtxyxyFZ3aSWROmnRRFQFT2BiPJd7jvRdzNDi6oLWaS2asMeYSNMjWTV4eNg==
  dependencies:
    "@babel/runtime" "^7.4.5"
    aria-query "^3.0.0"
    array-includes "^3.0.3"
    ast-types-flow "^0.0.7"
    axobject-query "^2.0.2"
    damerau-levenshtein "^1.0.4"
    emoji-regex "^7.0.2"
    has "^1.0.3"
    jsx-ast-utils "^2.2.1"

eslint-plugin-react-hooks@^1.6.1:
  version "1.7.0"
  resolved "https://registry.yarnpkg.com/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-1.7.0.tgz#6210b6d5a37205f0b92858f895a4e827020a7d04"
  integrity sha512-iXTCFcOmlWvw4+TOE8CLWj6yX1GwzT0Y6cUfHHZqWnSk144VmVIRcVGtUAzrLES7C798lmvnt02C7rxaOX1HNA==

eslint-plugin-react@7.19.0:
  version "7.19.0"
  resolved "https://registry.yarnpkg.com/eslint-plugin-react/-/eslint-plugin-react-7.19.0.tgz#6d08f9673628aa69c5559d33489e855d83551666"
  integrity sha512-SPT8j72CGuAP+JFbT0sJHOB80TX/pu44gQ4vXH/cq+hQTiY2PuZ6IHkqXJV6x1b28GDdo1lbInjKUrrdUf0LOQ==
  dependencies:
    array-includes "^3.1.1"
    doctrine "^2.1.0"
    has "^1.0.3"
    jsx-ast-utils "^2.2.3"
    object.entries "^1.1.1"
    object.fromentries "^2.0.2"
    object.values "^1.1.1"
    prop-types "^15.7.2"
    resolve "^1.15.1"
    semver "^6.3.0"
    string.prototype.matchall "^4.0.2"
    xregexp "^4.3.0"

eslint-scope@^4.0.3:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/eslint-scope/-/eslint-scope-4.0.3.tgz#ca03833310f6889a3264781aa82e63eb9cfe7848"
  integrity sha512-p7VutNr1O/QrxysMo3E45FjYDTeXBy0iTltPFNSqKAIfjDSXC+4dj+qfyuD8bfAXrW/y6lW3O76VaYNPKfpKrg==
  dependencies:
    esrecurse "^4.1.0"
    estraverse "^4.1.1"

eslint-scope@^5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/eslint-scope/-/eslint-scope-5.0.0.tgz#e87c8887c73e8d1ec84f1ca591645c358bfc8fb9"
  integrity sha512-oYrhJW7S0bxAFDvWqzvMPRm6pcgcnWc4QnofCAqRTRfQC0JcwenzGglTtsLyIuuWFfkqDG9vz67cnttSd53djw==
  dependencies:
    esrecurse "^4.1.0"
    estraverse "^4.1.1"

eslint-utils@^1.4.3:
  version "1.4.3"
  resolved "https://registry.yarnpkg.com/eslint-utils/-/eslint-utils-1.4.3.tgz#74fec7c54d0776b6f67e0251040b5806564e981f"
  integrity sha512-fbBN5W2xdY45KulGXmLHZ3c3FHfVYmKg0IrAKGOkT/464PQsx2UeIzfz1RmEci+KLm1bBaAzZAh8+/E+XAeZ8Q==
  dependencies:
    eslint-visitor-keys "^1.1.0"

eslint-visitor-keys@^1.0.0, eslint-visitor-keys@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/eslint-visitor-keys/-/eslint-visitor-keys-1.1.0.tgz#e2a82cea84ff246ad6fb57f9bde5b46621459ec2"
  integrity sha512-8y9YjtM1JBJU/A9Kc+SbaOV4y29sSWckBwMHa+FGtVj5gN/sbnKDf6xJUl+8g7FAij9LVaP8C24DUiH/f/2Z9A==

eslint@^6.6.0:
  version "6.8.0"
  resolved "https://registry.yarnpkg.com/eslint/-/eslint-6.8.0.tgz#62262d6729739f9275723824302fb227c8c93ffb"
  integrity sha512-K+Iayyo2LtyYhDSYwz5D5QdWw0hCacNzyq1Y821Xna2xSJj7cijoLLYmLxTQgcgZ9mC61nryMy9S7GRbYpI5Ig==
  dependencies:
    "@babel/code-frame" "^7.0.0"
    ajv "^6.10.0"
    chalk "^2.1.0"
    cross-spawn "^6.0.5"
    debug "^4.0.1"
    doctrine "^3.0.0"
    eslint-scope "^5.0.0"
    eslint-utils "^1.4.3"
    eslint-visitor-keys "^1.1.0"
    espree "^6.1.2"
    esquery "^1.0.1"
    esutils "^2.0.2"
    file-entry-cache "^5.0.1"
    functional-red-black-tree "^1.0.1"
    glob-parent "^5.0.0"
    globals "^12.1.0"
    ignore "^4.0.6"
    import-fresh "^3.0.0"
    imurmurhash "^0.1.4"
    inquirer "^7.0.0"
    is-glob "^4.0.0"
    js-yaml "^3.13.1"
    json-stable-stringify-without-jsonify "^1.0.1"
    levn "^0.3.0"
    lodash "^4.17.14"
    minimatch "^3.0.4"
    mkdirp "^0.5.1"
    natural-compare "^1.4.0"
    optionator "^0.8.3"
    progress "^2.0.0"
    regexpp "^2.0.1"
    semver "^6.1.2"
    strip-ansi "^5.2.0"
    strip-json-comments "^3.0.1"
    table "^5.2.3"
    text-table "^0.2.0"
    v8-compile-cache "^2.0.3"

espree@^6.1.2:
  version "6.2.1"
  resolved "https://registry.yarnpkg.com/espree/-/espree-6.2.1.tgz#77fc72e1fd744a2052c20f38a5b575832e82734a"
  integrity sha512-ysCxRQY3WaXJz9tdbWOwuWr5Y/XrPTGX9Kiz3yoUXwW0VZ4w30HTkQLaGx/+ttFjF8i+ACbArnB4ce68a9m5hw==
  dependencies:
    acorn "^7.1.1"
    acorn-jsx "^5.2.0"
    eslint-visitor-keys "^1.1.0"

esprima@^4.0.0, esprima@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/esprima/-/esprima-4.0.1.tgz#13b04cdb3e6c5d19df91ab6987a8695619b0aa71"
  integrity sha512-eGuFFw7Upda+g4p+QHvnW0RyTX/SVeJBDM/gCtMARO0cLuT2HcEKnTPvhjV6aGeqrCB/sbNop0Kszm0jsaWU4A==

esquery@^1.0.1:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/esquery/-/esquery-1.1.0.tgz#c5c0b66f383e7656404f86b31334d72524eddb48"
  integrity sha512-MxYW9xKmROWF672KqjO75sszsA8Mxhw06YFeS5VHlB98KDHbOSurm3ArsjO60Eaf3QmGMCP1yn+0JQkNLo/97Q==
  dependencies:
    estraverse "^4.0.0"

esrecurse@^4.1.0:
  version "4.2.1"
  resolved "https://registry.yarnpkg.com/esrecurse/-/esrecurse-4.2.1.tgz#007a3b9fdbc2b3bb87e4879ea19c92fdbd3942cf"
  integrity sha512-64RBB++fIOAXPw3P9cy89qfMlvZEXZkqqJkjqqXIvzP5ezRZjW+lPWjw35UX/3EhUPFYbg5ER4JYgDw4007/DQ==
  dependencies:
    estraverse "^4.1.0"

estraverse@^4.0.0, estraverse@^4.1.0, estraverse@^4.1.1, estraverse@^4.2.0:
  version "4.3.0"
  resolved "https://registry.yarnpkg.com/estraverse/-/estraverse-4.3.0.tgz#398ad3f3c5a24948be7725e83d11a7de28cdbd1d"
  integrity sha512-39nnKffWz8xN1BU/2c79n9nB9HDzo0niYUqx6xyqUnyoAnQyyWpOTdZEeiCch8BBu515t4wp9ZmgVfVhn9EBpw==

esutils@^2.0.2:
  version "2.0.3"
  resolved "https://registry.yarnpkg.com/esutils/-/esutils-2.0.3.tgz#74d2eb4de0b8da1293711910d50775b9b710ef64"
  integrity sha512-kVscqXk4OCp68SZ0dkgEKVi6/8ij300KBWTJq32P/dYeWTSwK41WyTxalN1eRmA5Z9UU/LX9D7FWSmV9SAYx6g==

etag@~1.8.1:
  version "1.8.1"
  resolved "https://registry.yarnpkg.com/etag/-/etag-1.8.1.tgz#41ae2eeb65efa62268aebfea83ac7d79299b0887"
  integrity sha1-Qa4u62XvpiJorr/qg6x9eSmbCIc=

eventemitter3@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/eventemitter3/-/eventemitter3-4.0.0.tgz#d65176163887ee59f386d64c82610b696a4a74eb"
  integrity sha512-qerSRB0p+UDEssxTtm6EDKcE7W4OaoisfIMl4CngyEhjpYglocpNg6UEqCvemdGhosAsg4sO2dXJOdyBifPGCg==

events@^3.0.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/events/-/events-3.1.0.tgz#84279af1b34cb75aa88bf5ff291f6d0bd9b31a59"
  integrity sha512-Rv+u8MLHNOdMjTAFeT3nCjHn2aGlx435FP/sDHNaRhDEMwyI/aB22Kj2qIN8R0cw3z28psEQLYwxVKLsKrMgWg==

eventsource@^1.0.7:
  version "1.0.7"
  resolved "https://registry.yarnpkg.com/eventsource/-/eventsource-1.0.7.tgz#8fbc72c93fcd34088090bc0a4e64f4b5cee6d8d0"
  integrity sha512-4Ln17+vVT0k8aWq+t/bF5arcS3EpT9gYtW66EPacdj/mAFevznsnyoHLPy2BA8gbIQeIHoPsvwmfBftfcG//BQ==
  dependencies:
    original "^1.0.0"

evp_bytestokey@^1.0.0, evp_bytestokey@^1.0.3:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/evp_bytestokey/-/evp_bytestokey-1.0.3.tgz#7fcbdb198dc71959432efe13842684e0525acb02"
  integrity sha512-/f2Go4TognH/KvCISP7OUsHn85hT9nUkxxA9BEWxFn+Oj9o8ZNLm/40hdlgSLyuOimsrTKLUMEorQexp/aPQeA==
  dependencies:
    md5.js "^1.3.4"
    safe-buffer "^5.1.1"

exec-sh@^0.3.2:
  version "0.3.4"
  resolved "https://registry.yarnpkg.com/exec-sh/-/exec-sh-0.3.4.tgz#3a018ceb526cc6f6df2bb504b2bfe8e3a4934ec5"
  integrity sha512-sEFIkc61v75sWeOe72qyrqg2Qg0OuLESziUDk/O/z2qgS15y2gWVFrI6f2Qn/qw/0/NCfCEsmNA4zOjkwEZT1A==

execa@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/execa/-/execa-1.0.0.tgz#c6236a5bb4df6d6f15e88e7f017798216749ddd8"
  integrity sha512-adbxcyWV46qiHyvSp50TKt05tB4tK3HcmF7/nxfAdhnox83seTDbwnaqKO4sXRy7roHAIFqJP/Rw/AuEbX61LA==
  dependencies:
    cross-spawn "^6.0.0"
    get-stream "^4.0.0"
    is-stream "^1.1.0"
    npm-run-path "^2.0.0"
    p-finally "^1.0.0"
    signal-exit "^3.0.0"
    strip-eof "^1.0.0"

exit@^0.1.2:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/exit/-/exit-0.1.2.tgz#0632638f8d877cc82107d30a0fff1a17cba1cd0c"
  integrity sha1-BjJjj42HfMghB9MKD/8aF8uhzQw=

expand-brackets@^2.1.4:
  version "2.1.4"
  resolved "https://registry.yarnpkg.com/expand-brackets/-/expand-brackets-2.1.4.tgz#b77735e315ce30f6b6eff0f83b04151a22449622"
  integrity sha1-t3c14xXOMPa27/D4OwQVGiJEliI=
  dependencies:
    debug "^2.3.3"
    define-property "^0.2.5"
    extend-shallow "^2.0.1"
    posix-character-classes "^0.1.0"
    regex-not "^1.0.0"
    snapdragon "^0.8.1"
    to-regex "^3.0.1"

expect@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/expect/-/expect-24.9.0.tgz#b75165b4817074fa4a157794f46fe9f1ba15b6ca"
  integrity sha512-wvVAx8XIol3Z5m9zvZXiyZOQ+sRJqNTIm6sGjdWlaZIeupQGO3WbYI+15D/AmEwZywL6wtJkbAbJtzkOfBuR0Q==
  dependencies:
    "@jest/types" "^24.9.0"
    ansi-styles "^3.2.0"
    jest-get-type "^24.9.0"
    jest-matcher-utils "^24.9.0"
    jest-message-util "^24.9.0"
    jest-regex-util "^24.9.0"

express@^4.17.1:
  version "4.17.1"
  resolved "https://registry.yarnpkg.com/express/-/express-4.17.1.tgz#4491fc38605cf51f8629d39c2b5d026f98a4c134"
  integrity sha512-mHJ9O79RqluphRrcw2X/GTh3k9tVv8YcoyY4Kkh4WDMUYKRZUq0h1o0w2rrrxBqM7VoeUVqgb27xlEMXTnYt4g==
  dependencies:
    accepts "~1.3.7"
    array-flatten "1.1.1"
    body-parser "1.19.0"
    content-disposition "0.5.3"
    content-type "~1.0.4"
    cookie "0.4.0"
    cookie-signature "1.0.6"
    debug "2.6.9"
    depd "~1.1.2"
    encodeurl "~1.0.2"
    escape-html "~1.0.3"
    etag "~1.8.1"
    finalhandler "~1.1.2"
    fresh "0.5.2"
    merge-descriptors "1.0.1"
    methods "~1.1.2"
    on-finished "~2.3.0"
    parseurl "~1.3.3"
    path-to-regexp "0.1.7"
    proxy-addr "~2.0.5"
    qs "6.7.0"
    range-parser "~1.2.1"
    safe-buffer "5.1.2"
    send "0.17.1"
    serve-static "1.14.1"
    setprototypeof "1.1.1"
    statuses "~1.5.0"
    type-is "~1.6.18"
    utils-merge "1.0.1"
    vary "~1.1.2"

ext@^1.1.2:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/ext/-/ext-1.4.0.tgz#89ae7a07158f79d35517882904324077e4379244"
  integrity sha512-Key5NIsUxdqKg3vIsdw9dSuXpPCQ297y6wBjL30edxwPgt2E44WcWBZey/ZvUc6sERLTxKdyCu4gZFmUbk1Q7A==
  dependencies:
    type "^2.0.0"

extend-shallow@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/extend-shallow/-/extend-shallow-2.0.1.tgz#51af7d614ad9a9f610ea1bafbb989d6b1c56890f"
  integrity sha1-Ua99YUrZqfYQ6huvu5idaxxWiQ8=
  dependencies:
    is-extendable "^0.1.0"

extend-shallow@^3.0.0, extend-shallow@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/extend-shallow/-/extend-shallow-3.0.2.tgz#26a71aaf073b39fb2127172746131c2704028db8"
  integrity sha1-Jqcarwc7OfshJxcnRhMcJwQCjbg=
  dependencies:
    assign-symbols "^1.0.0"
    is-extendable "^1.0.1"

extend@~3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/extend/-/extend-3.0.2.tgz#f8b1136b4071fbd8eb140aff858b1019ec2915fa"
  integrity sha512-fjquC59cD7CyW6urNXK0FBufkZcoiGG80wTuPujX590cB5Ttln20E2UB4S/WARVqhXffZl2LNgS+gQdPIIim/g==

external-editor@^3.0.3:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/external-editor/-/external-editor-3.1.0.tgz#cb03f740befae03ea4d283caed2741a83f335495"
  integrity sha512-hMQ4CX1p1izmuLYyZqLMO/qGNw10wSv9QDCPfzXfyFrOaCSSoRfqE1Kf1s5an66J5JZC62NewG+mK49jOCtQew==
  dependencies:
    chardet "^0.7.0"
    iconv-lite "^0.4.24"
    tmp "^0.0.33"

extglob@^2.0.4:
  version "2.0.4"
  resolved "https://registry.yarnpkg.com/extglob/-/extglob-2.0.4.tgz#ad00fe4dc612a9232e8718711dc5cb5ab0285543"
  integrity sha512-Nmb6QXkELsuBr24CJSkilo6UHHgbekK5UiZgfE6UHD3Eb27YC6oD+bhcT+tJ6cl8dmsgdQxnWlcry8ksBIBLpw==
  dependencies:
    array-unique "^0.3.2"
    define-property "^1.0.0"
    expand-brackets "^2.1.4"
    extend-shallow "^2.0.1"
    fragment-cache "^0.2.1"
    regex-not "^1.0.0"
    snapdragon "^0.8.1"
    to-regex "^3.0.1"

extsprintf@1.3.0:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/extsprintf/-/extsprintf-1.3.0.tgz#96918440e3041a7a414f8c52e3c574eb3c3e1e05"
  integrity sha1-lpGEQOMEGnpBT4xS48V06zw+HgU=

extsprintf@^1.2.0:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/extsprintf/-/extsprintf-1.4.0.tgz#e2689f8f356fad62cca65a3a91c5df5f9551692f"
  integrity sha1-4mifjzVvrWLMplo6kcXfX5VRaS8=

fast-deep-equal@^3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/fast-deep-equal/-/fast-deep-equal-3.1.1.tgz#545145077c501491e33b15ec408c294376e94ae4"
  integrity sha512-8UEa58QDLauDNfpbrX55Q9jrGHThw2ZMdOky5Gl1CDtVeJDPVrG4Jxx1N8jw2gkWaff5UUuX1KJd+9zGe2B+ZA==

fast-glob@^2.0.2:
  version "2.2.7"
  resolved "https://registry.yarnpkg.com/fast-glob/-/fast-glob-2.2.7.tgz#6953857c3afa475fff92ee6015d52da70a4cd39d"
  integrity sha512-g1KuQwHOZAmOZMuBtHdxDtju+T2RT8jgCC9aANsbpdiDDTSnjgfuVsIBNKbUeJI3oKMRExcfNDtJl4OhbffMsw==
  dependencies:
    "@mrmlnc/readdir-enhanced" "^2.2.1"
    "@nodelib/fs.stat" "^1.1.2"
    glob-parent "^3.1.0"
    is-glob "^4.0.0"
    merge2 "^1.2.3"
    micromatch "^3.1.10"

fast-json-stable-stringify@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/fast-json-stable-stringify/-/fast-json-stable-stringify-2.1.0.tgz#874bf69c6f404c2b5d99c481341399fd55892633"
  integrity sha512-lhd/wF+Lk98HZoTCtlVraHtfh5XYijIjalXck7saUtuanSDyLMxnHhSXEDJqHxD7msR8D0uCmqlkwjCV8xvwHw==

fast-levenshtein@~2.0.6:
  version "2.0.6"
  resolved "https://registry.yarnpkg.com/fast-levenshtein/-/fast-levenshtein-2.0.6.tgz#3d8a5c66883a16a30ca8643e851f19baa7797917"
  integrity sha1-PYpcZog6FqMMqGQ+hR8Zuqd5eRc=

faye-websocket@^0.10.0:
  version "0.10.0"
  resolved "https://registry.yarnpkg.com/faye-websocket/-/faye-websocket-0.10.0.tgz#4e492f8d04dfb6f89003507f6edbf2d501e7c6f4"
  integrity sha1-TkkvjQTftviQA1B/btvy1QHnxvQ=
  dependencies:
    websocket-driver ">=0.5.1"

faye-websocket@~0.11.1:
  version "0.11.3"
  resolved "https://registry.yarnpkg.com/faye-websocket/-/faye-websocket-0.11.3.tgz#5c0e9a8968e8912c286639fde977a8b209f2508e"
  integrity sha512-D2y4bovYpzziGgbHYtGCMjlJM36vAl/y+xUyn1C+FVx8szd1E+86KwVw6XvYSzOP8iMpm1X0I4xJD+QtUb36OA==
  dependencies:
    websocket-driver ">=0.5.1"

fb-watchman@^2.0.0:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/fb-watchman/-/fb-watchman-2.0.1.tgz#fc84fb39d2709cf3ff6d743706157bb5708a8a85"
  integrity sha512-DkPJKQeY6kKwmuMretBhr7G6Vodr7bFwDYTXIkfG1gjvNpaxBTQV3PbXg6bR1c1UP4jPOX0jHUbbHANL9vRjVg==
  dependencies:
    bser "2.1.1"

figgy-pudding@^3.5.1:
  version "3.5.1"
  resolved "https://registry.yarnpkg.com/figgy-pudding/-/figgy-pudding-3.5.1.tgz#862470112901c727a0e495a80744bd5baa1d6790"
  integrity sha512-vNKxJHTEKNThjfrdJwHc7brvM6eVevuO5nTj6ez8ZQ1qbXTvGthucRF7S4vf2cr71QVnT70V34v0S1DyQsti0w==

figures@^3.0.0:
  version "3.2.0"
  resolved "https://registry.yarnpkg.com/figures/-/figures-3.2.0.tgz#625c18bd293c604dc4a8ddb2febf0c88341746af"
  integrity sha512-yaduQFRKLXYOGgEn6AZau90j3ggSOyiqXU0F9JZfeXYhNa+Jk4X+s45A2zg5jns87GAFa34BBm2kXw4XpNcbdg==
  dependencies:
    escape-string-regexp "^1.0.5"

file-entry-cache@^5.0.1:
  version "5.0.1"
  resolved "https://registry.yarnpkg.com/file-entry-cache/-/file-entry-cache-5.0.1.tgz#ca0f6efa6dd3d561333fb14515065c2fafdf439c"
  integrity sha512-bCg29ictuBaKUwwArK4ouCaqDgLZcysCFLmM/Yn/FDoqndh/9vNuQfXRDvTuXKLxfD/JtZQGKFT8MGcJBK644g==
  dependencies:
    flat-cache "^2.0.1"

file-loader@4.3.0:
  version "4.3.0"
  resolved "https://registry.yarnpkg.com/file-loader/-/file-loader-4.3.0.tgz#780f040f729b3d18019f20605f723e844b8a58af"
  integrity sha512-aKrYPYjF1yG3oX0kWRrqrSMfgftm7oJW5M+m4owoldH5C51C0RkIwB++JbRvEW3IU6/ZG5n8UvEcdgwOt2UOWA==
  dependencies:
    loader-utils "^1.2.3"
    schema-utils "^2.5.0"

file-uri-to-path@1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/file-uri-to-path/-/file-uri-to-path-1.0.0.tgz#553a7b8446ff6f684359c445f1e37a05dacc33dd"
  integrity sha512-0Zt+s3L7Vf1biwWZ29aARiVYLx7iMGnEUl9x33fbB/j3jR81u/O2LbqK+Bm1CDSNDKVtJ/YjwY7TUd5SkeLQLw==

filesize@6.0.1:
  version "6.0.1"
  resolved "https://registry.yarnpkg.com/filesize/-/filesize-6.0.1.tgz#f850b509909c7c86f7e450ea19006c31c2ed3d2f"
  integrity sha512-u4AYWPgbI5GBhs6id1KdImZWn5yfyFrrQ8OWZdN7ZMfA8Bf4HcO0BGo9bmUIEV8yrp8I1xVfJ/dn90GtFNNJcg==

fill-range@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/fill-range/-/fill-range-4.0.0.tgz#d544811d428f98eb06a63dc402d2403c328c38f7"
  integrity sha1-1USBHUKPmOsGpj3EAtJAPDKMOPc=
  dependencies:
    extend-shallow "^2.0.1"
    is-number "^3.0.0"
    repeat-string "^1.6.1"
    to-regex-range "^2.1.0"

fill-range@^7.0.1:
  version "7.0.1"
  resolved "https://registry.yarnpkg.com/fill-range/-/fill-range-7.0.1.tgz#1919a6a7c75fe38b2c7c77e5198535da9acdda40"
  integrity sha512-qOo9F+dMUmC2Lcb4BbVvnKJxTPjCm+RRpe4gDuGrzkL7mEVl/djYSu2OdQ2Pa302N4oqkSg9ir6jaLWJ2USVpQ==
  dependencies:
    to-regex-range "^5.0.1"

finalhandler@~1.1.2:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/finalhandler/-/finalhandler-1.1.2.tgz#b7e7d000ffd11938d0fdb053506f6ebabe9f587d"
  integrity sha512-aAWcW57uxVNrQZqFXjITpW3sIUQmHGG3qSb9mUah9MgMC4NeWhNOlNjXEYq3HjRAvL6arUviZGGJsBg6z0zsWA==
  dependencies:
    debug "2.6.9"
    encodeurl "~1.0.2"
    escape-html "~1.0.3"
    on-finished "~2.3.0"
    parseurl "~1.3.3"
    statuses "~1.5.0"
    unpipe "~1.0.0"

find-cache-dir@^0.1.1:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/find-cache-dir/-/find-cache-dir-0.1.1.tgz#c8defae57c8a52a8a784f9e31c57c742e993a0b9"
  integrity sha1-yN765XyKUqinhPnjHFfHQumToLk=
  dependencies:
    commondir "^1.0.1"
    mkdirp "^0.5.1"
    pkg-dir "^1.0.0"

find-cache-dir@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/find-cache-dir/-/find-cache-dir-2.1.0.tgz#8d0f94cd13fe43c6c7c261a0d86115ca918c05f7"
  integrity sha512-Tq6PixE0w/VMFfCgbONnkiQIVol/JJL7nRMi20fqzA4NRs9AfeqMGeRdPi3wIhYkxjeBaWh2rxwapn5Tu3IqOQ==
  dependencies:
    commondir "^1.0.1"
    make-dir "^2.0.0"
    pkg-dir "^3.0.0"

find-cache-dir@^3.2.0:
  version "3.3.1"
  resolved "https://registry.yarnpkg.com/find-cache-dir/-/find-cache-dir-3.3.1.tgz#89b33fad4a4670daa94f855f7fbe31d6d84fe880"
  integrity sha512-t2GDMt3oGC/v+BMwzmllWDuJF/xcDtE5j/fCGbqDD7OLuJkj0cfh1YSA5VKPvwMeLFLNDBkwOKZ2X85jGLVftQ==
  dependencies:
    commondir "^1.0.1"
    make-dir "^3.0.2"
    pkg-dir "^4.1.0"

find-up@4.1.0, find-up@^4.0.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/find-up/-/find-up-4.1.0.tgz#97afe7d6cdc0bc5928584b7c8d7b16e8a9aa5d19"
  integrity sha512-PpOwAdQ/YlXQ2vj8a3h8IipDuYRi3wceVQQGYWxNINccq40Anw7BlsEXCMbt1Zt+OLA6Fq9suIpIWD0OsnISlw==
  dependencies:
    locate-path "^5.0.0"
    path-exists "^4.0.0"

find-up@^1.0.0:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/find-up/-/find-up-1.1.2.tgz#6b2e9822b1a2ce0a60ab64d610eccad53cb24d0f"
  integrity sha1-ay6YIrGizgpgq2TWEOzK1TyyTQ8=
  dependencies:
    path-exists "^2.0.0"
    pinkie-promise "^2.0.0"

find-up@^2.0.0, find-up@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/find-up/-/find-up-2.1.0.tgz#45d1b7e506c717ddd482775a2b77920a3c0c57a7"
  integrity sha1-RdG35QbHF93UgndaK3eSCjwMV6c=
  dependencies:
    locate-path "^2.0.0"

find-up@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/find-up/-/find-up-3.0.0.tgz#49169f1d7993430646da61ecc5ae355c21c97b73"
  integrity sha512-1yD6RmLI1XBfxugvORwlck6f75tYL+iR0jqwsOrOxMZyGYqUuDhJ0l4AXdO1iX/FTs9cBAMEk1gWSEx1kSbylg==
  dependencies:
    locate-path "^3.0.0"

flat-cache@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/flat-cache/-/flat-cache-2.0.1.tgz#5d296d6f04bda44a4630a301413bdbc2ec085ec0"
  integrity sha512-LoQe6yDuUMDzQAEH8sgmh4Md6oZnc/7PjtwjNFSzveXqSHt6ka9fPBuso7IGf9Rz4uqnSnWiFH2B/zj24a5ReA==
  dependencies:
    flatted "^2.0.0"
    rimraf "2.6.3"
    write "1.0.3"

flatted@^2.0.0:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/flatted/-/flatted-2.0.1.tgz#69e57caa8f0eacbc281d2e2cb458d46fdb449e08"
  integrity sha512-a1hQMktqW9Nmqr5aktAux3JMNqaucxGcjtjWnZLHX7yyPCmlSV3M54nGYbqT8K+0GhF3NBgmJCc3ma+WOgX8Jg==

flatten@^1.0.2:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/flatten/-/flatten-1.0.3.tgz#c1283ac9f27b368abc1e36d1ff7b04501a30356b"
  integrity sha512-dVsPA/UwQ8+2uoFe5GHtiBMu48dWLTdsuEd7CKGlZlD78r1TTWBvDuFaFGKCo/ZfEr95Uk56vZoX86OsHkUeIg==

flush-write-stream@^1.0.0:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/flush-write-stream/-/flush-write-stream-1.1.1.tgz#8dd7d873a1babc207d94ead0c2e0e44276ebf2e8"
  integrity sha512-3Z4XhFZ3992uIq0XOqb9AreonueSYphE6oYbpt5+3u06JWklbsPkNv3ZKkP9Bz/r+1MWCaMoSQ28P85+1Yc77w==
  dependencies:
    inherits "^2.0.3"
    readable-stream "^2.3.6"

follow-redirects@^1.0.0:
  version "1.10.0"
  resolved "https://registry.yarnpkg.com/follow-redirects/-/follow-redirects-1.10.0.tgz#01f5263aee921c6a54fb91667f08f4155ce169eb"
  integrity sha512-4eyLK6s6lH32nOvLLwlIOnr9zrL8Sm+OvW4pVTJNoXeGzYIkHVf+pADQi+OJ0E67hiuSLezPVPyBcIZO50TmmQ==
  dependencies:
    debug "^3.0.0"

for-in@^0.1.3:
  version "0.1.8"
  resolved "https://registry.yarnpkg.com/for-in/-/for-in-0.1.8.tgz#d8773908e31256109952b1fdb9b3fa867d2775e1"
  integrity sha1-2Hc5COMSVhCZUrH9ubP6hn0ndeE=

for-in@^1.0.1, for-in@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/for-in/-/for-in-1.0.2.tgz#81068d295a8142ec0ac726c6e2200c30fb6d5e80"
  integrity sha1-gQaNKVqBQuwKxybG4iAMMPttXoA=

for-own@^0.1.3:
  version "0.1.5"
  resolved "https://registry.yarnpkg.com/for-own/-/for-own-0.1.5.tgz#5265c681a4f294dabbf17c9509b6763aa84510ce"
  integrity sha1-UmXGgaTylNq78XyVCbZ2OqhFEM4=
  dependencies:
    for-in "^1.0.1"

forever-agent@~0.6.1:
  version "0.6.1"
  resolved "https://registry.yarnpkg.com/forever-agent/-/forever-agent-0.6.1.tgz#fbc71f0c41adeb37f96c577ad1ed42d8fdacca91"
  integrity sha1-+8cfDEGt6zf5bFd60e1C2P2sypE=

fork-ts-checker-webpack-plugin@3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/fork-ts-checker-webpack-plugin/-/fork-ts-checker-webpack-plugin-3.1.1.tgz#a1642c0d3e65f50c2cc1742e9c0a80f441f86b19"
  integrity sha512-DuVkPNrM12jR41KM2e+N+styka0EgLkTnXmNcXdgOM37vtGeY+oCBK/Jx0hzSeEU6memFCtWb4htrHPMDfwwUQ==
  dependencies:
    babel-code-frame "^6.22.0"
    chalk "^2.4.1"
    chokidar "^3.3.0"
    micromatch "^3.1.10"
    minimatch "^3.0.4"
    semver "^5.6.0"
    tapable "^1.0.0"
    worker-rpc "^0.1.0"

form-data@~2.3.2:
  version "2.3.3"
  resolved "https://registry.yarnpkg.com/form-data/-/form-data-2.3.3.tgz#dcce52c05f644f298c6a7ab936bd724ceffbf3a6"
  integrity sha512-1lLKB2Mu3aGP1Q/2eCOx0fNbRMe7XdwktwOruhfqqd0rIJWwN4Dh+E3hrPSlDCXnSR7UtZ1N38rVXm+6+MEhJQ==
  dependencies:
    asynckit "^0.4.0"
    combined-stream "^1.0.6"
    mime-types "^2.1.12"

forwarded@~0.1.2:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/forwarded/-/forwarded-0.1.2.tgz#98c23dab1175657b8c0573e8ceccd91b0ff18c84"
  integrity sha1-mMI9qxF1ZXuMBXPozszZGw/xjIQ=

fragment-cache@^0.2.1:
  version "0.2.1"
  resolved "https://registry.yarnpkg.com/fragment-cache/-/fragment-cache-0.2.1.tgz#4290fad27f13e89be7f33799c6bc5a0abfff0d19"
  integrity sha1-QpD60n8T6Jvn8zeZxrxaCr//DRk=
  dependencies:
    map-cache "^0.2.2"

fresh@0.5.2:
  version "0.5.2"
  resolved "https://registry.yarnpkg.com/fresh/-/fresh-0.5.2.tgz#3d8cadd90d976569fa835ab1f8e4b23a105605a7"
  integrity sha1-PYyt2Q2XZWn6g1qx+OSyOhBWBac=

from2@^2.1.0:
  version "2.3.0"
  resolved "https://registry.yarnpkg.com/from2/-/from2-2.3.0.tgz#8bfb5502bde4a4d36cfdeea007fcca21d7e382af"
  integrity sha1-i/tVAr3kpNNs/e6gB/zKIdfjgq8=
  dependencies:
    inherits "^2.0.1"
    readable-stream "^2.0.0"

fs-extra@^4.0.2:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/fs-extra/-/fs-extra-4.0.3.tgz#0d852122e5bc5beb453fb028e9c0c9bf36340c94"
  integrity sha512-q6rbdDd1o2mAnQreO7YADIxf/Whx4AHBiRf6d+/cVT8h44ss+lHgxf1FemcqDnQt9X3ct4McHr+JMGlYSsK7Cg==
  dependencies:
    graceful-fs "^4.1.2"
    jsonfile "^4.0.0"
    universalify "^0.1.0"

fs-extra@^7.0.0:
  version "7.0.1"
  resolved "https://registry.yarnpkg.com/fs-extra/-/fs-extra-7.0.1.tgz#4f189c44aa123b895f722804f55ea23eadc348e9"
  integrity sha512-YJDaCJZEnBmcbw13fvdAM9AwNOJwOzrE4pqMqBq5nFiEqXUqHwlK4B+3pUw6JNvfSPtX05xFHtYy/1ni01eGCw==
  dependencies:
    graceful-fs "^4.1.2"
    jsonfile "^4.0.0"
    universalify "^0.1.0"

fs-extra@^8.1.0:
  version "8.1.0"
  resolved "https://registry.yarnpkg.com/fs-extra/-/fs-extra-8.1.0.tgz#49d43c45a88cd9677668cb7be1b46efdb8d2e1c0"
  integrity sha512-yhlQgA6mnOJUKOsRUFsgJdQCvkKhcz8tlZG5HBQfReYZy46OwLcY+Zia0mtdHsOo9y/hP+CxMN0TU9QxoOtG4g==
  dependencies:
    graceful-fs "^4.2.0"
    jsonfile "^4.0.0"
    universalify "^0.1.0"

fs-minipass@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/fs-minipass/-/fs-minipass-2.1.0.tgz#7f5036fdbf12c63c169190cbe4199c852271f9fb"
  integrity sha512-V/JgOLFCS+R6Vcq0slCuaeWEdNC3ouDlJMNIsacH2VtALiu9mV4LPrHc5cDl8k5aw6J8jwgWWpiTo5RYhmIzvg==
  dependencies:
    minipass "^3.0.0"

fs-write-stream-atomic@^1.0.8:
  version "1.0.10"
  resolved "https://registry.yarnpkg.com/fs-write-stream-atomic/-/fs-write-stream-atomic-1.0.10.tgz#b47df53493ef911df75731e70a9ded0189db40c9"
  integrity sha1-tH31NJPvkR33VzHnCp3tAYnbQMk=
  dependencies:
    graceful-fs "^4.1.2"
    iferr "^0.1.5"
    imurmurhash "^0.1.4"
    readable-stream "1 || 2"

fs.realpath@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/fs.realpath/-/fs.realpath-1.0.0.tgz#1504ad2523158caa40db4a2787cb01411994ea4f"
  integrity sha1-FQStJSMVjKpA20onh8sBQRmU6k8=

fsevents@2.1.2, fsevents@~2.1.2:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/fsevents/-/fsevents-2.1.2.tgz#4c0a1fb34bc68e543b4b82a9ec392bfbda840805"
  integrity sha512-R4wDiBwZ0KzpgOWetKDug1FZcYhqYnUYKtfZYt4mD5SBz76q0KR4Q9o7GIPamsVPGmW3EYPPJ0dOOjvx32ldZA==

fsevents@^1.2.7:
  version "1.2.12"
  resolved "https://registry.yarnpkg.com/fsevents/-/fsevents-1.2.12.tgz#db7e0d8ec3b0b45724fd4d83d43554a8f1f0de5c"
  integrity sha512-Ggd/Ktt7E7I8pxZRbGIs7vwqAPscSESMrCSkx2FtWeqmheJgCo2R74fTsZFCifr0VTPwqRpPv17+6b8Zp7th0Q==
  dependencies:
    bindings "^1.5.0"
    nan "^2.12.1"

function-bind@^1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/function-bind/-/function-bind-1.1.1.tgz#a56899d3ea3c9bab874bb9773b7c5ede92f4895d"
  integrity sha512-yIovAzMX49sF8Yl58fSCWJ5svSLuaibPxXQJFLmBObTuCr0Mf1KiPopGM9NiFjiYBCbfaa2Fh6breQ6ANVTI0A==

functional-red-black-tree@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/functional-red-black-tree/-/functional-red-black-tree-1.0.1.tgz#1b0ab3bd553b2a0d6399d29c0e3ea0b252078327"
  integrity sha1-GwqzvVU7Kg1jmdKcDj6gslIHgyc=

gensync@^1.0.0-beta.1:
  version "1.0.0-beta.1"
  resolved "https://registry.yarnpkg.com/gensync/-/gensync-1.0.0-beta.1.tgz#58f4361ff987e5ff6e1e7a210827aa371eaac269"
  integrity sha512-r8EC6NO1sngH/zdD9fiRDLdcgnbayXah+mLgManTaIZJqEC1MZstmnox8KpnI2/fxQwrp5OpCOYWLp4rBl4Jcg==

get-caller-file@^1.0.1:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/get-caller-file/-/get-caller-file-1.0.3.tgz#f978fa4c90d1dfe7ff2d6beda2a515e713bdcf4a"
  integrity sha512-3t6rVToeoZfYSGd8YoLFR2DJkiQrIiUrGcjvFX2mDw3bn6k2OtwHN0TNCLbBO+w8qTvimhDkv+LSscbJY1vE6w==

get-caller-file@^2.0.1:
  version "2.0.5"
  resolved "https://registry.yarnpkg.com/get-caller-file/-/get-caller-file-2.0.5.tgz#4f94412a82db32f36e3b0b9741f8a97feb031f7e"
  integrity sha512-DyFP3BM/3YHTQOCUL/w0OZHR0lpKeGrxotcHWcqNEdnltqFwXVfhEBQ94eIo34AfQpo0rGki4cyIiftY06h2Fg==

get-own-enumerable-property-symbols@^3.0.0:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/get-own-enumerable-property-symbols/-/get-own-enumerable-property-symbols-3.0.2.tgz#b5fde77f22cbe35f390b4e089922c50bce6ef664"
  integrity sha512-I0UBV/XOz1XkIJHEUDMZAbzCThU/H8DxmSfmdGcKPnVhu2VfFqr34jr9777IyaTYvxjedWhqVIilEDsCdP5G6g==

get-stream@^4.0.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/get-stream/-/get-stream-4.1.0.tgz#c1b255575f3dc21d59bfc79cd3d2b46b1c3a54b5"
  integrity sha512-GMat4EJ5161kIy2HevLlr4luNjBgvmj413KaQA7jt4V8B4RDsfpHk7WQ9GVqfYyyx8OS/L66Kox+rJRNklLK7w==
  dependencies:
    pump "^3.0.0"

get-value@^2.0.3, get-value@^2.0.6:
  version "2.0.6"
  resolved "https://registry.yarnpkg.com/get-value/-/get-value-2.0.6.tgz#dc15ca1c672387ca76bd37ac0a395ba2042a2c28"
  integrity sha1-3BXKHGcjh8p2vTesCjlbogQqLCg=

getpass@^0.1.1:
  version "0.1.7"
  resolved "https://registry.yarnpkg.com/getpass/-/getpass-0.1.7.tgz#5eff8e3e684d569ae4cb2b1282604e8ba62149fa"
  integrity sha1-Xv+OPmhNVprkyysSgmBOi6YhSfo=
  dependencies:
    assert-plus "^1.0.0"

glob-parent@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/glob-parent/-/glob-parent-3.1.0.tgz#9e6af6299d8d3bd2bd40430832bd113df906c5ae"
  integrity sha1-nmr2KZ2NO9K9QEMIMr0RPfkGxa4=
  dependencies:
    is-glob "^3.1.0"
    path-dirname "^1.0.0"

glob-parent@^5.0.0, glob-parent@~5.1.0:
  version "5.1.0"
  resolved "https://registry.yarnpkg.com/glob-parent/-/glob-parent-5.1.0.tgz#5f4c1d1e748d30cd73ad2944b3577a81b081e8c2"
  integrity sha512-qjtRgnIVmOfnKUE3NJAQEdk+lKrxfw8t5ke7SXtfMTHcjsBfOfWXCQfdb30zfDoZQ2IRSIiidmjtbHZPZ++Ihw==
  dependencies:
    is-glob "^4.0.1"

glob-to-regexp@^0.3.0:
  version "0.3.0"
  resolved "https://registry.yarnpkg.com/glob-to-regexp/-/glob-to-regexp-0.3.0.tgz#8c5a1494d2066c570cc3bfe4496175acc4d502ab"
  integrity sha1-jFoUlNIGbFcMw7/kSWF1rMTVAqs=

glob@^7.0.3, glob@^7.1.1, glob@^7.1.2, glob@^7.1.3, glob@^7.1.4, glob@^7.1.6:
  version "7.1.6"
  resolved "https://registry.yarnpkg.com/glob/-/glob-7.1.6.tgz#141f33b81a7c2492e125594307480c46679278a6"
  integrity sha512-LwaxwyZ72Lk7vZINtNNrywX0ZuLyStrdDtabefZKAY5ZGJhVtgdznluResxNmPitE0SAO+O26sWTHeKSI2wMBA==
  dependencies:
    fs.realpath "^1.0.0"
    inflight "^1.0.4"
    inherits "2"
    minimatch "^3.0.4"
    once "^1.3.0"
    path-is-absolute "^1.0.0"

global-modules@2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/global-modules/-/global-modules-2.0.0.tgz#997605ad2345f27f51539bea26574421215c7780"
  integrity sha512-NGbfmJBp9x8IxyJSd1P+otYK8vonoJactOogrVfFRIAEY1ukil8RSKDz2Yo7wh1oihl51l/r6W4epkeKJHqL8A==
  dependencies:
    global-prefix "^3.0.0"

global-prefix@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/global-prefix/-/global-prefix-3.0.0.tgz#fc85f73064df69f50421f47f883fe5b913ba9b97"
  integrity sha512-awConJSVCHVGND6x3tmMaKcQvwXLhjdkmomy2W+Goaui8YPgYgXJZewhg3fWC+DlfqqQuWg8AwqjGTD2nAPVWg==
  dependencies:
    ini "^1.3.5"
    kind-of "^6.0.2"
    which "^1.3.1"

globals@^11.1.0:
  version "11.12.0"
  resolved "https://registry.yarnpkg.com/globals/-/globals-11.12.0.tgz#ab8795338868a0babd8525758018c2a7eb95c42e"
  integrity sha512-WOBp/EEGUiIsJSp7wcv/y6MO+lV9UoncWqxuFfm8eBwzWNgyfBd6Gz+IeKQ9jCmyhoH99g15M3T+QaVHFjizVA==

globals@^12.1.0:
  version "12.4.0"
  resolved "https://registry.yarnpkg.com/globals/-/globals-12.4.0.tgz#a18813576a41b00a24a97e7f815918c2e19925f8"
  integrity sha512-BWICuzzDvDoH54NHKCseDanAhE3CeDorgDL5MT6LMXXj2WCnd9UC2szdk4AWLfjdgNBCXLUanXYcpBBKOSWGwg==
  dependencies:
    type-fest "^0.8.1"

globby@8.0.2:
  version "8.0.2"
  resolved "https://registry.yarnpkg.com/globby/-/globby-8.0.2.tgz#5697619ccd95c5275dbb2d6faa42087c1a941d8d"
  integrity sha512-yTzMmKygLp8RUpG1Ymu2VXPSJQZjNAZPD4ywgYEaG7e4tBJeUQBO8OpXrf1RCNcEs5alsoJYPAMiIHP0cmeC7w==
  dependencies:
    array-union "^1.0.1"
    dir-glob "2.0.0"
    fast-glob "^2.0.2"
    glob "^7.1.2"
    ignore "^3.3.5"
    pify "^3.0.0"
    slash "^1.0.0"

globby@^6.1.0:
  version "6.1.0"
  resolved "https://registry.yarnpkg.com/globby/-/globby-6.1.0.tgz#f5a6d70e8395e21c858fb0489d64df02424d506c"
  integrity sha1-9abXDoOV4hyFj7BInWTfAkJNUGw=
  dependencies:
    array-union "^1.0.1"
    glob "^7.0.3"
    object-assign "^4.0.1"
    pify "^2.0.0"
    pinkie-promise "^2.0.0"

graceful-fs@^4.1.11, graceful-fs@^4.1.15, graceful-fs@^4.1.2, graceful-fs@^4.1.6, graceful-fs@^4.2.0, graceful-fs@^4.2.2:
  version "4.2.3"
  resolved "https://registry.yarnpkg.com/graceful-fs/-/graceful-fs-4.2.3.tgz#4a12ff1b60376ef09862c2093edd908328be8423"
  integrity sha512-a30VEBm4PEdx1dRB7MFK7BejejvCvBronbLjht+sHuGYj8PHs7M/5Z+rt5lw551vZ7yfTCj4Vuyy3mSJytDWRQ==

growly@^1.3.0:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/growly/-/growly-1.3.0.tgz#f10748cbe76af964b7c96c93c6bcc28af120c081"
  integrity sha1-8QdIy+dq+WS3yWyTxrzCivEgwIE=

gzip-size@5.1.1:
  version "5.1.1"
  resolved "https://registry.yarnpkg.com/gzip-size/-/gzip-size-5.1.1.tgz#cb9bee692f87c0612b232840a873904e4c135274"
  integrity sha512-FNHi6mmoHvs1mxZAds4PpdCS6QG8B4C1krxJsMutgxl5t3+GlRTzzI3NEkifXx2pVsOvJdOGSmIgDhQ55FwdPA==
  dependencies:
    duplexer "^0.1.1"
    pify "^4.0.1"

handle-thing@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/handle-thing/-/handle-thing-2.0.0.tgz#0e039695ff50c93fc288557d696f3c1dc6776754"
  integrity sha512-d4sze1JNC454Wdo2fkuyzCr6aHcbL6PGGuFAz0Li/NcOm1tCHGnWDRmJP85dh9IhQErTc2svWFEX5xHIOo//kQ==

har-schema@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/har-schema/-/har-schema-2.0.0.tgz#a94c2224ebcac04782a0d9035521f24735b7ec92"
  integrity sha1-qUwiJOvKwEeCoNkDVSHyRzW37JI=

har-validator@~5.1.3:
  version "5.1.3"
  resolved "https://registry.yarnpkg.com/har-validator/-/har-validator-5.1.3.tgz#1ef89ebd3e4996557675eed9893110dc350fa080"
  integrity sha512-sNvOCzEQNr/qrvJgc3UG/kD4QtlHycrzwS+6mfTrrSq97BvaYcPZZI1ZSqGSPR73Cxn4LKTD4PttRwfU7jWq5g==
  dependencies:
    ajv "^6.5.5"
    har-schema "^2.0.0"

harmony-reflect@^1.4.6:
  version "1.6.1"
  resolved "https://registry.yarnpkg.com/harmony-reflect/-/harmony-reflect-1.6.1.tgz#c108d4f2bb451efef7a37861fdbdae72c9bdefa9"
  integrity sha512-WJTeyp0JzGtHcuMsi7rw2VwtkvLa+JyfEKJCFyfcS0+CDkjQ5lHPu7zEhFZP+PDSRrEgXa5Ah0l1MbgbE41XjA==

has-ansi@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/has-ansi/-/has-ansi-2.0.0.tgz#34f5049ce1ecdf2b0649af3ef24e45ed35416d91"
  integrity sha1-NPUEnOHs3ysGSa8+8k5F7TVBbZE=
  dependencies:
    ansi-regex "^2.0.0"

has-flag@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/has-flag/-/has-flag-3.0.0.tgz#b5d454dc2199ae225699f3467e5a07f3b955bafd"
  integrity sha1-tdRU3CGZriJWmfNGfloH87lVuv0=

has-flag@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/has-flag/-/has-flag-4.0.0.tgz#944771fd9c81c81265c4d6941860da06bb59479b"
  integrity sha512-EykJT/Q1KjTWctppgIAgfSO0tKVuZUjhgMr17kqTumMl6Afv3EISleU7qZUzoXDFTAHTDC4NOoG/ZxU3EvlMPQ==

has-symbols@^1.0.0, has-symbols@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/has-symbols/-/has-symbols-1.0.1.tgz#9f5214758a44196c406d9bd76cebf81ec2dd31e8"
  integrity sha512-PLcsoqu++dmEIZB+6totNFKq/7Do+Z0u4oT0zKOJNl3lYK6vGwwu2hjHs+68OEZbTjiUE9bgOABXbP/GvrS0Kg==

has-value@^0.3.1:
  version "0.3.1"
  resolved "https://registry.yarnpkg.com/has-value/-/has-value-0.3.1.tgz#7b1f58bada62ca827ec0a2078025654845995e1f"
  integrity sha1-ex9YutpiyoJ+wKIHgCVlSEWZXh8=
  dependencies:
    get-value "^2.0.3"
    has-values "^0.1.4"
    isobject "^2.0.0"

has-value@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/has-value/-/has-value-1.0.0.tgz#18b281da585b1c5c51def24c930ed29a0be6b177"
  integrity sha1-GLKB2lhbHFxR3vJMkw7SmgvmsXc=
  dependencies:
    get-value "^2.0.6"
    has-values "^1.0.0"
    isobject "^3.0.0"

has-values@^0.1.4:
  version "0.1.4"
  resolved "https://registry.yarnpkg.com/has-values/-/has-values-0.1.4.tgz#6d61de95d91dfca9b9a02089ad384bff8f62b771"
  integrity sha1-bWHeldkd/Km5oCCJrThL/49it3E=

has-values@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/has-values/-/has-values-1.0.0.tgz#95b0b63fec2146619a6fe57fe75628d5a39efe4f"
  integrity sha1-lbC2P+whRmGab+V/51Yo1aOe/k8=
  dependencies:
    is-number "^3.0.0"
    kind-of "^4.0.0"

has@^1.0.0, has@^1.0.3:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/has/-/has-1.0.3.tgz#722d7cbfc1f6aa8241f16dd814e011e1f41e8796"
  integrity sha512-f2dvO0VU6Oej7RkWJGrehjbzMAjFp5/VKPp5tTpWIV4JHHZK1/BxbFRtf/siA2SWTe09caDmVtYYzWEIbBS4zw==
  dependencies:
    function-bind "^1.1.1"

hash-base@^3.0.0:
  version "3.0.4"
  resolved "https://registry.yarnpkg.com/hash-base/-/hash-base-3.0.4.tgz#5fc8686847ecd73499403319a6b0a3f3f6ae4918"
  integrity sha1-X8hoaEfs1zSZQDMZprCj8/auSRg=
  dependencies:
    inherits "^2.0.1"
    safe-buffer "^5.0.1"

hash.js@^1.0.0, hash.js@^1.0.3:
  version "1.1.7"
  resolved "https://registry.yarnpkg.com/hash.js/-/hash.js-1.1.7.tgz#0babca538e8d4ee4a0f8988d68866537a003cf42"
  integrity sha512-taOaskGt4z4SOANNseOviYDvjEJinIkRgmp7LbKP2YTTmVxWBl87s/uzK9r+44BclBSp2X7K1hqeNfz9JbBeXA==
  dependencies:
    inherits "^2.0.3"
    minimalistic-assert "^1.0.1"

he@^1.2.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/he/-/he-1.2.0.tgz#84ae65fa7eafb165fddb61566ae14baf05664f0f"
  integrity sha512-F/1DnUGPopORZi0ni+CvrCgHQ5FyEAHRLSApuYWMmrbSwoN2Mn/7k+Gl38gJnR7yyDZk6WLXwiGod1JOWNDKGw==

hex-color-regex@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/hex-color-regex/-/hex-color-regex-1.1.0.tgz#4c06fccb4602fe2602b3c93df82d7e7dbf1a8a8e"
  integrity sha512-l9sfDFsuqtOqKDsQdqrMRk0U85RZc0RtOR9yPI7mRVOa4FsR/BVnZ0shmQRM96Ji99kYZP/7hn1cedc1+ApsTQ==

hmac-drbg@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/hmac-drbg/-/hmac-drbg-1.0.1.tgz#d2745701025a6c775a6c545793ed502fc0c649a1"
  integrity sha1-0nRXAQJabHdabFRXk+1QL8DGSaE=
  dependencies:
    hash.js "^1.0.3"
    minimalistic-assert "^1.0.0"
    minimalistic-crypto-utils "^1.0.1"

hosted-git-info@^2.1.4:
  version "2.8.8"
  resolved "https://registry.yarnpkg.com/hosted-git-info/-/hosted-git-info-2.8.8.tgz#7539bd4bc1e0e0a895815a2e0262420b12858488"
  integrity sha512-f/wzC2QaWBs7t9IYqB4T3sR1xviIViXJRJTWBlx2Gf3g0Xi5vI7Yy4koXQ1c9OYDGHN9sBy1DQ2AB8fqZBWhUg==

hpack.js@^2.1.6:
  version "2.1.6"
  resolved "https://registry.yarnpkg.com/hpack.js/-/hpack.js-2.1.6.tgz#87774c0949e513f42e84575b3c45681fade2a0b2"
  integrity sha1-h3dMCUnlE/QuhFdbPEVoH63ioLI=
  dependencies:
    inherits "^2.0.1"
    obuf "^1.0.0"
    readable-stream "^2.0.1"
    wbuf "^1.1.0"

hsl-regex@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/hsl-regex/-/hsl-regex-1.0.0.tgz#d49330c789ed819e276a4c0d272dffa30b18fe6e"
  integrity sha1-1JMwx4ntgZ4nakwNJy3/owsY/m4=

hsla-regex@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/hsla-regex/-/hsla-regex-1.0.0.tgz#c1ce7a3168c8c6614033a4b5f7877f3b225f9c38"
  integrity sha1-wc56MWjIxmFAM6S194d/OyJfnDg=

html-comment-regex@^1.1.0:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/html-comment-regex/-/html-comment-regex-1.1.2.tgz#97d4688aeb5c81886a364faa0cad1dda14d433a7"
  integrity sha512-P+M65QY2JQ5Y0G9KKdlDpo0zK+/OHptU5AaBwUfAIDJZk1MYf32Frm84EcOytfJE0t5JvkAnKlmjsXDnWzCJmQ==

html-encoding-sniffer@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/html-encoding-sniffer/-/html-encoding-sniffer-1.0.2.tgz#e70d84b94da53aa375e11fe3a351be6642ca46f8"
  integrity sha512-71lZziiDnsuabfdYiUeWdCVyKuqwWi23L8YeIgV9jSSZHCtb6wB1BKWooH7L3tn4/FuZJMVWyNaIDr4RGmaSYw==
  dependencies:
    whatwg-encoding "^1.0.1"

html-entities@^1.2.1:
  version "1.2.1"
  resolved "https://registry.yarnpkg.com/html-entities/-/html-entities-1.2.1.tgz#0df29351f0721163515dfb9e5543e5f6eed5162f"
  integrity sha1-DfKTUfByEWNRXfueVUPl9u7VFi8=

html-escaper@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/html-escaper/-/html-escaper-2.0.0.tgz#71e87f931de3fe09e56661ab9a29aadec707b491"
  integrity sha512-a4u9BeERWGu/S8JiWEAQcdrg9v4QArtP9keViQjGMdff20fBdd8waotXaNmODqBe6uZ3Nafi7K/ho4gCQHV3Ig==

html-minifier-terser@^5.0.1:
  version "5.0.4"
  resolved "https://registry.yarnpkg.com/html-minifier-terser/-/html-minifier-terser-5.0.4.tgz#e8cc02748acb983bd7912ea9660bd31c0702ec32"
  integrity sha512-fHwmKQ+GzhlqdxEtwrqLT7MSuheiA+rif5/dZgbz3GjoMXJzcRzy1L9NXoiiyxrnap+q5guSiv8Tz5lrh9g42g==
  dependencies:
    camel-case "^4.1.1"
    clean-css "^4.2.3"
    commander "^4.1.1"
    he "^1.2.0"
    param-case "^3.0.3"
    relateurl "^0.2.7"
    terser "^4.6.3"

html-webpack-plugin@4.0.0-beta.11:
  version "4.0.0-beta.11"
  resolved "https://registry.yarnpkg.com/html-webpack-plugin/-/html-webpack-plugin-4.0.0-beta.11.tgz#3059a69144b5aecef97708196ca32f9e68677715"
  integrity sha512-4Xzepf0qWxf8CGg7/WQM5qBB2Lc/NFI7MhU59eUDTkuQp3skZczH4UA1d6oQyDEIoMDgERVhRyTdtUPZ5s5HBg==
  dependencies:
    html-minifier-terser "^5.0.1"
    loader-utils "^1.2.3"
    lodash "^4.17.15"
    pretty-error "^2.1.1"
    tapable "^1.1.3"
    util.promisify "1.0.0"

htmlparser2@^3.3.0:
  version "3.10.1"
  resolved "https://registry.yarnpkg.com/htmlparser2/-/htmlparser2-3.10.1.tgz#bd679dc3f59897b6a34bb10749c855bb53a9392f"
  integrity sha512-IgieNijUMbkDovyoKObU1DUhm1iwNYE/fuifEoEHfd1oZKZDaONBSkal7Y01shxsM49R4XaMdGez3WnF9UfiCQ==
  dependencies:
    domelementtype "^1.3.1"
    domhandler "^2.3.0"
    domutils "^1.5.1"
    entities "^1.1.1"
    inherits "^2.0.1"
    readable-stream "^3.1.1"

http-deceiver@^1.2.7:
  version "1.2.7"
  resolved "https://registry.yarnpkg.com/http-deceiver/-/http-deceiver-1.2.7.tgz#fa7168944ab9a519d337cb0bec7284dc3e723d87"
  integrity sha1-+nFolEq5pRnTN8sL7HKE3D5yPYc=

http-errors@1.7.2:
  version "1.7.2"
  resolved "https://registry.yarnpkg.com/http-errors/-/http-errors-1.7.2.tgz#4f5029cf13239f31036e5b2e55292bcfbcc85c8f"
  integrity sha512-uUQBt3H/cSIVfch6i1EuPNy/YsRSOUBXTVfZ+yR7Zjez3qjBz6i9+i4zjNaoqcoFVI4lQJ5plg63TvGfRSDCRg==
  dependencies:
    depd "~1.1.2"
    inherits "2.0.3"
    setprototypeof "1.1.1"
    statuses ">= 1.5.0 < 2"
    toidentifier "1.0.0"

http-errors@~1.6.2:
  version "1.6.3"
  resolved "https://registry.yarnpkg.com/http-errors/-/http-errors-1.6.3.tgz#8b55680bb4be283a0b5bf4ea2e38580be1d9320d"
  integrity sha1-i1VoC7S+KDoLW/TqLjhYC+HZMg0=
  dependencies:
    depd "~1.1.2"
    inherits "2.0.3"
    setprototypeof "1.1.0"
    statuses ">= 1.4.0 < 2"

http-errors@~1.7.2:
  version "1.7.3"
  resolved "https://registry.yarnpkg.com/http-errors/-/http-errors-1.7.3.tgz#6c619e4f9c60308c38519498c14fbb10aacebb06"
  integrity sha512-ZTTX0MWrsQ2ZAhA1cejAwDLycFsd7I7nVtnkT3Ol0aqodaKW+0CTZDQ1uBv5whptCnc8e8HeRRJxRs0kmm/Qfw==
  dependencies:
    depd "~1.1.2"
    inherits "2.0.4"
    setprototypeof "1.1.1"
    statuses ">= 1.5.0 < 2"
    toidentifier "1.0.0"

"http-parser-js@>=0.4.0 <0.4.11":
  version "0.4.10"
  resolved "https://registry.yarnpkg.com/http-parser-js/-/http-parser-js-0.4.10.tgz#92c9c1374c35085f75db359ec56cc257cbb93fa4"
  integrity sha1-ksnBN0w1CF912zWexWzCV8u5P6Q=

http-proxy-middleware@0.19.1:
  version "0.19.1"
  resolved "https://registry.yarnpkg.com/http-proxy-middleware/-/http-proxy-middleware-0.19.1.tgz#183c7dc4aa1479150306498c210cdaf96080a43a"
  integrity sha512-yHYTgWMQO8VvwNS22eLLloAkvungsKdKTLO8AJlftYIKNfJr3GK3zK0ZCfzDDGUBttdGc8xFy1mCitvNKQtC3Q==
  dependencies:
    http-proxy "^1.17.0"
    is-glob "^4.0.0"
    lodash "^4.17.11"
    micromatch "^3.1.10"

http-proxy@^1.17.0:
  version "1.18.0"
  resolved "https://registry.yarnpkg.com/http-proxy/-/http-proxy-1.18.0.tgz#dbe55f63e75a347db7f3d99974f2692a314a6a3a"
  integrity sha512-84I2iJM/n1d4Hdgc6y2+qY5mDaz2PUVjlg9znE9byl+q0uC3DeByqBGReQu5tpLK0TAqTIXScRUV+dg7+bUPpQ==
  dependencies:
    eventemitter3 "^4.0.0"
    follow-redirects "^1.0.0"
    requires-port "^1.0.0"

http-signature@~1.2.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/http-signature/-/http-signature-1.2.0.tgz#9aecd925114772f3d95b65a60abb8f7c18fbace1"
  integrity sha1-muzZJRFHcvPZW2WmCruPfBj7rOE=
  dependencies:
    assert-plus "^1.0.0"
    jsprim "^1.2.2"
    sshpk "^1.7.0"

https-browserify@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/https-browserify/-/https-browserify-1.0.0.tgz#ec06c10e0a34c0f2faf199f7fd7fc78fffd03c73"
  integrity sha1-7AbBDgo0wPL68Zn3/X/Hj//QPHM=

iconv-lite@0.4.24, iconv-lite@^0.4.24:
  version "0.4.24"
  resolved "https://registry.yarnpkg.com/iconv-lite/-/iconv-lite-0.4.24.tgz#2022b4b25fbddc21d2f524974a474aafe733908b"
  integrity sha512-v3MXnZAcvnywkTUEZomIActle7RXXeedOR31wwl7VlyoXO4Qi9arvSenNQWne1TcRwhCL1HwLI21bEqdpj8/rA==
  dependencies:
    safer-buffer ">= 2.1.2 < 3"

icss-utils@^4.0.0, icss-utils@^4.1.1:
  version "4.1.1"
  resolved "https://registry.yarnpkg.com/icss-utils/-/icss-utils-4.1.1.tgz#21170b53789ee27447c2f47dd683081403f9a467"
  integrity sha512-4aFq7wvWyMHKgxsH8QQtGpvbASCf+eM3wPRLI6R+MgAnTCZ6STYsRvttLvRWK0Nfif5piF394St3HeJDaljGPA==
  dependencies:
    postcss "^7.0.14"

identity-obj-proxy@3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/identity-obj-proxy/-/identity-obj-proxy-3.0.0.tgz#94d2bda96084453ef36fbc5aaec37e0f79f1fc14"
  integrity sha1-lNK9qWCERT7zb7xarsN+D3nx/BQ=
  dependencies:
    harmony-reflect "^1.4.6"

ieee754@^1.1.4:
  version "1.1.13"
  resolved "https://registry.yarnpkg.com/ieee754/-/ieee754-1.1.13.tgz#ec168558e95aa181fd87d37f55c32bbcb6708b84"
  integrity sha512-4vf7I2LYV/HaWerSo3XmlMkp5eZ83i+/CDluXi/IGTs/O1sejBNhTtnxzmRZfvOUqj7lZjqHkeTvpgSFDlWZTg==

iferr@^0.1.5:
  version "0.1.5"
  resolved "https://registry.yarnpkg.com/iferr/-/iferr-0.1.5.tgz#c60eed69e6d8fdb6b3104a1fcbca1c192dc5b501"
  integrity sha1-xg7taebY/bazEEofy8ocGS3FtQE=

ignore@^3.3.5:
  version "3.3.10"
  resolved "https://registry.yarnpkg.com/ignore/-/ignore-3.3.10.tgz#0a97fb876986e8081c631160f8f9f389157f0043"
  integrity sha512-Pgs951kaMm5GXP7MOvxERINe3gsaVjUWFm+UZPSq9xYriQAksyhg0csnS0KXSNRD5NmNdapXEpjxG49+AKh/ug==

ignore@^4.0.6:
  version "4.0.6"
  resolved "https://registry.yarnpkg.com/ignore/-/ignore-4.0.6.tgz#750e3db5862087b4737ebac8207ffd1ef27b25fc"
  integrity sha512-cyFDKrqc/YdcWFniJhzI42+AzS+gNwmUzOSFcRCQYwySuBBBy/KjuxWLZ/FHEH6Moq1NizMOBWyTcv8O4OZIMg==

immer@1.10.0:
  version "1.10.0"
  resolved "https://registry.yarnpkg.com/immer/-/immer-1.10.0.tgz#bad67605ba9c810275d91e1c2a47d4582e98286d"
  integrity sha512-O3sR1/opvCDGLEVcvrGTMtLac8GJ5IwZC4puPrLuRj3l7ICKvkmA0vGuU9OW8mV9WIBRnaxp5GJh9IEAaNOoYg==

import-cwd@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/import-cwd/-/import-cwd-2.1.0.tgz#aa6cf36e722761285cb371ec6519f53e2435b0a9"
  integrity sha1-qmzzbnInYShcs3HsZRn1PiQ1sKk=
  dependencies:
    import-from "^2.1.0"

import-fresh@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/import-fresh/-/import-fresh-2.0.0.tgz#d81355c15612d386c61f9ddd3922d4304822a546"
  integrity sha1-2BNVwVYS04bGH53dOSLUMEgipUY=
  dependencies:
    caller-path "^2.0.0"
    resolve-from "^3.0.0"

import-fresh@^3.0.0, import-fresh@^3.1.0:
  version "3.2.1"
  resolved "https://registry.yarnpkg.com/import-fresh/-/import-fresh-3.2.1.tgz#633ff618506e793af5ac91bf48b72677e15cbe66"
  integrity sha512-6e1q1cnWP2RXD9/keSkxHScg508CdXqXWgWBaETNhyuBFz+kUZlKboh+ISK+bU++DmbHimVBrOz/zzPe0sZ3sQ==
  dependencies:
    parent-module "^1.0.0"
    resolve-from "^4.0.0"

import-from@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/import-from/-/import-from-2.1.0.tgz#335db7f2a7affd53aaa471d4b8021dee36b7f3b1"
  integrity sha1-M1238qev/VOqpHHUuAId7ja387E=
  dependencies:
    resolve-from "^3.0.0"

import-local@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/import-local/-/import-local-2.0.0.tgz#55070be38a5993cf18ef6db7e961f5bee5c5a09d"
  integrity sha512-b6s04m3O+s3CGSbqDIyP4R6aAwAeYlVq9+WUWep6iHa8ETRf9yei1U48C5MmfJmV9AiLYYBKPMq/W+/WRpQmCQ==
  dependencies:
    pkg-dir "^3.0.0"
    resolve-cwd "^2.0.0"

imurmurhash@^0.1.4:
  version "0.1.4"
  resolved "https://registry.yarnpkg.com/imurmurhash/-/imurmurhash-0.1.4.tgz#9218b9b2b928a238b13dc4fb6b6d576f231453ea"
  integrity sha1-khi5srkoojixPcT7a21XbyMUU+o=

indent-string@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/indent-string/-/indent-string-4.0.0.tgz#624f8f4497d619b2d9768531d58f4122854d7251"
  integrity sha512-EdDDZu4A2OyIK7Lr/2zG+w5jmbuk1DVBnEwREQvBzspBJkCEbRa8GxU1lghYcaGJCnRWibjDXlq779X1/y5xwg==

indexes-of@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/indexes-of/-/indexes-of-1.0.1.tgz#f30f716c8e2bd346c7b67d3df3915566a7c05607"
  integrity sha1-8w9xbI4r00bHtn0985FVZqfAVgc=

infer-owner@^1.0.3, infer-owner@^1.0.4:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/infer-owner/-/infer-owner-1.0.4.tgz#c4cefcaa8e51051c2a40ba2ce8a3d27295af9467"
  integrity sha512-IClj+Xz94+d7irH5qRyfJonOdfTzuDaifE6ZPWfx0N0+/ATZCbuTPq2prFl526urkQd90WyUKIh1DfBQ2hMz9A==

inflight@^1.0.4:
  version "1.0.6"
  resolved "https://registry.yarnpkg.com/inflight/-/inflight-1.0.6.tgz#49bd6331d7d02d0c09bc910a1075ba8165b56df9"
  integrity sha1-Sb1jMdfQLQwJvJEKEHW6gWW1bfk=
  dependencies:
    once "^1.3.0"
    wrappy "1"

inherits@2, inherits@2.0.4, inherits@^2.0.1, inherits@^2.0.3, inherits@~2.0.1, inherits@~2.0.3:
  version "2.0.4"
  resolved "https://registry.yarnpkg.com/inherits/-/inherits-2.0.4.tgz#0fa2c64f932917c3433a0ded55363aae37416b7c"
  integrity sha512-k/vGaX4/Yla3WzyMCvTQOXYeIHvqOKtnqBduzTHpzpQZzAskKMhZ2K+EnBiSM9zGSoIFeMpXKxa4dYeZIQqewQ==

inherits@2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/inherits/-/inherits-2.0.1.tgz#b17d08d326b4423e568eff719f91b0b1cbdf69f1"
  integrity sha1-sX0I0ya0Qj5Wjv9xn5GwscvfafE=

inherits@2.0.3:
  version "2.0.3"
  resolved "https://registry.yarnpkg.com/inherits/-/inherits-2.0.3.tgz#633c2c83e3da42a502f52466022480f4208261de"
  integrity sha1-Yzwsg+PaQqUC9SRmAiSA9CCCYd4=

ini@^1.3.5:
  version "1.3.5"
  resolved "https://registry.yarnpkg.com/ini/-/ini-1.3.5.tgz#eee25f56db1c9ec6085e0c22778083f596abf927"
  integrity sha512-RZY5huIKCMRWDUqZlEi72f/lmXKMvuszcMBduliQ3nnWbx9X/ZBQO7DijMEYS9EhHBb2qacRUMtC7svLwe0lcw==

inquirer@7.0.4:
  version "7.0.4"
  resolved "https://registry.yarnpkg.com/inquirer/-/inquirer-7.0.4.tgz#99af5bde47153abca23f5c7fc30db247f39da703"
  integrity sha512-Bu5Td5+j11sCkqfqmUTiwv+tWisMtP0L7Q8WrqA2C/BbBhy1YTdFrvjjlrKq8oagA/tLQBski2Gcx/Sqyi2qSQ==
  dependencies:
    ansi-escapes "^4.2.1"
    chalk "^2.4.2"
    cli-cursor "^3.1.0"
    cli-width "^2.0.0"
    external-editor "^3.0.3"
    figures "^3.0.0"
    lodash "^4.17.15"
    mute-stream "0.0.8"
    run-async "^2.2.0"
    rxjs "^6.5.3"
    string-width "^4.1.0"
    strip-ansi "^5.1.0"
    through "^2.3.6"

inquirer@^7.0.0:
  version "7.1.0"
  resolved "https://registry.yarnpkg.com/inquirer/-/inquirer-7.1.0.tgz#1298a01859883e17c7264b82870ae1034f92dd29"
  integrity sha512-5fJMWEmikSYu0nv/flMc475MhGbB7TSPd/2IpFV4I4rMklboCH2rQjYY5kKiYGHqUF9gvaambupcJFFG9dvReg==
  dependencies:
    ansi-escapes "^4.2.1"
    chalk "^3.0.0"
    cli-cursor "^3.1.0"
    cli-width "^2.0.0"
    external-editor "^3.0.3"
    figures "^3.0.0"
    lodash "^4.17.15"
    mute-stream "0.0.8"
    run-async "^2.4.0"
    rxjs "^6.5.3"
    string-width "^4.1.0"
    strip-ansi "^6.0.0"
    through "^2.3.6"

internal-ip@^4.3.0:
  version "4.3.0"
  resolved "https://registry.yarnpkg.com/internal-ip/-/internal-ip-4.3.0.tgz#845452baad9d2ca3b69c635a137acb9a0dad0907"
  integrity sha512-S1zBo1D6zcsyuC6PMmY5+55YMILQ9av8lotMx447Bq6SAgo/sDK6y6uUKmuYhW7eacnIhFfsPmCNYdDzsnnDCg==
  dependencies:
    default-gateway "^4.2.0"
    ipaddr.js "^1.9.0"

internal-slot@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/internal-slot/-/internal-slot-1.0.2.tgz#9c2e9fb3cd8e5e4256c6f45fe310067fcfa378a3"
  integrity sha512-2cQNfwhAfJIkU4KZPkDI+Gj5yNNnbqi40W9Gge6dfnk4TocEVm00B3bdiL+JINrbGJil2TeHvM4rETGzk/f/0g==
  dependencies:
    es-abstract "^1.17.0-next.1"
    has "^1.0.3"
    side-channel "^1.0.2"

invariant@^2.2.2, invariant@^2.2.4:
  version "2.2.4"
  resolved "https://registry.yarnpkg.com/invariant/-/invariant-2.2.4.tgz#610f3c92c9359ce1db616e538008d23ff35158e6"
  integrity sha512-phJfQVBuaJM5raOpJjSfkiD6BpbCE4Ns//LaXl6wGYtUBY83nWS6Rf9tXm2e8VaK60JEjYldbPif/A2B1C2gNA==
  dependencies:
    loose-envify "^1.0.0"

invert-kv@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/invert-kv/-/invert-kv-2.0.0.tgz#7393f5afa59ec9ff5f67a27620d11c226e3eec02"
  integrity sha512-wPVv/y/QQ/Uiirj/vh3oP+1Ww+AWehmi1g5fFWGPF6IpCBCDVrhgHRMvrLfdYcwDh3QJbGXDW4JAuzxElLSqKA==

ip-regex@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/ip-regex/-/ip-regex-2.1.0.tgz#fa78bf5d2e6913c911ce9f819ee5146bb6d844e9"
  integrity sha1-+ni/XS5pE8kRzp+BnuUUa7bYROk=

ip@^1.1.0, ip@^1.1.5:
  version "1.1.5"
  resolved "https://registry.yarnpkg.com/ip/-/ip-1.1.5.tgz#bdded70114290828c0a039e72ef25f5aaec4354a"
  integrity sha1-vd7XARQpCCjAoDnnLvJfWq7ENUo=

ipaddr.js@1.9.1, ipaddr.js@^1.9.0:
  version "1.9.1"
  resolved "https://registry.yarnpkg.com/ipaddr.js/-/ipaddr.js-1.9.1.tgz#bff38543eeb8984825079ff3a2a8e6cbd46781b3"
  integrity sha512-0KI/607xoxSToH7GjN1FfSbLoU0+btTicjsQSWQlh/hZykN8KpmMf7uYwPW3R+akZ6R/w18ZlXSHBYXiYUPO3g==

is-absolute-url@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/is-absolute-url/-/is-absolute-url-2.1.0.tgz#50530dfb84fcc9aa7dbe7852e83a37b93b9f2aa6"
  integrity sha1-UFMN+4T8yap9vnhS6Do3uTufKqY=

is-absolute-url@^3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/is-absolute-url/-/is-absolute-url-3.0.3.tgz#96c6a22b6a23929b11ea0afb1836c36ad4a5d698"
  integrity sha512-opmNIX7uFnS96NtPmhWQgQx6/NYFgsUXYMllcfzwWKUMwfo8kku1TvE6hkNcH+Q1ts5cMVrsY7j0bxXQDciu9Q==

is-accessor-descriptor@^0.1.6:
  version "0.1.6"
  resolved "https://registry.yarnpkg.com/is-accessor-descriptor/-/is-accessor-descriptor-0.1.6.tgz#a9e12cb3ae8d876727eeef3843f8a0897b5c98d6"
  integrity sha1-qeEss66Nh2cn7u84Q/igiXtcmNY=
  dependencies:
    kind-of "^3.0.2"

is-accessor-descriptor@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/is-accessor-descriptor/-/is-accessor-descriptor-1.0.0.tgz#169c2f6d3df1f992618072365c9b0ea1f6878656"
  integrity sha512-m5hnHTkcVsPfqx3AKlyttIPb7J+XykHvJP2B9bZDjlhLIoEq4XoK64Vg7boZlVWYK6LUY94dYPEE7Lh0ZkZKcQ==
  dependencies:
    kind-of "^6.0.0"

is-arguments@^1.0.4:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/is-arguments/-/is-arguments-1.0.4.tgz#3faf966c7cba0ff437fb31f6250082fcf0448cf3"
  integrity sha512-xPh0Rmt8NE65sNzvyUmWgI1tz3mKq74lGA0mL8LYZcoIzKOzDh6HmrYm3d18k60nHerC8A9Km8kYu87zfSFnLA==

is-arrayish@^0.2.1:
  version "0.2.1"
  resolved "https://registry.yarnpkg.com/is-arrayish/-/is-arrayish-0.2.1.tgz#77c99840527aa8ecb1a8ba697b80645a7a926a9d"
  integrity sha1-d8mYQFJ6qOyxqLppe4BkWnqSap0=

is-arrayish@^0.3.1:
  version "0.3.2"
  resolved "https://registry.yarnpkg.com/is-arrayish/-/is-arrayish-0.3.2.tgz#4574a2ae56f7ab206896fb431eaeed066fdf8f03"
  integrity sha512-eVRqCvVlZbuw3GrM63ovNSNAeA1K16kaR/LRY/92w0zxQ5/1YzwblUX652i4Xs9RwAGjW9d9y6X88t8OaAJfWQ==

is-binary-path@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/is-binary-path/-/is-binary-path-1.0.1.tgz#75f16642b480f187a711c814161fd3a4a7655898"
  integrity sha1-dfFmQrSA8YenEcgUFh/TpKdlWJg=
  dependencies:
    binary-extensions "^1.0.0"

is-binary-path@~2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/is-binary-path/-/is-binary-path-2.1.0.tgz#ea1f7f3b80f064236e83470f86c09c254fb45b09"
  integrity sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==
  dependencies:
    binary-extensions "^2.0.0"

is-buffer@^1.0.2, is-buffer@^1.1.5:
  version "1.1.6"
  resolved "https://registry.yarnpkg.com/is-buffer/-/is-buffer-1.1.6.tgz#efaa2ea9daa0d7ab2ea13a97b2b8ad51fefbe8be"
  integrity sha512-NcdALwpXkTm5Zvvbk7owOUSvVvBKDgKP5/ewfXEznmQFfs4ZRmanOeKBTjRVjka3QFoN6XJ+9F3USqfHqTaU5w==

is-callable@^1.1.4, is-callable@^1.1.5:
  version "1.1.5"
  resolved "https://registry.yarnpkg.com/is-callable/-/is-callable-1.1.5.tgz#f7e46b596890456db74e7f6e976cb3273d06faab"
  integrity sha512-ESKv5sMCJB2jnHTWZ3O5itG+O128Hsus4K4Qh1h2/cgn2vbgnLSVqfV46AeJA9D5EeeLa9w81KUXMtn34zhX+Q==

is-ci@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/is-ci/-/is-ci-2.0.0.tgz#6bc6334181810e04b5c22b3d589fdca55026404c"
  integrity sha512-YfJT7rkpQB0updsdHLGWrvhBJfcfzNNawYDNIyQXJz0IViGf75O8EBPKSdvw2rF+LGCsX4FZ8tcr3b19LcZq4w==
  dependencies:
    ci-info "^2.0.0"

is-color-stop@^1.0.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/is-color-stop/-/is-color-stop-1.1.0.tgz#cfff471aee4dd5c9e158598fbe12967b5cdad345"
  integrity sha1-z/9HGu5N1cnhWFmPvhKWe1za00U=
  dependencies:
    css-color-names "^0.0.4"
    hex-color-regex "^1.1.0"
    hsl-regex "^1.0.0"
    hsla-regex "^1.0.0"
    rgb-regex "^1.0.1"
    rgba-regex "^1.0.0"

is-data-descriptor@^0.1.4:
  version "0.1.4"
  resolved "https://registry.yarnpkg.com/is-data-descriptor/-/is-data-descriptor-0.1.4.tgz#0b5ee648388e2c860282e793f1856fec3f301b56"
  integrity sha1-C17mSDiOLIYCgueT8YVv7D8wG1Y=
  dependencies:
    kind-of "^3.0.2"

is-data-descriptor@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/is-data-descriptor/-/is-data-descriptor-1.0.0.tgz#d84876321d0e7add03990406abbbbd36ba9268c7"
  integrity sha512-jbRXy1FmtAoCjQkVmIVYwuuqDFUbaOeDjmed1tOGPrsMhtJA4rD9tkgA0F1qJ3gRFRXcHYVkdeaP50Q5rE/jLQ==
  dependencies:
    kind-of "^6.0.0"

is-date-object@^1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/is-date-object/-/is-date-object-1.0.2.tgz#bda736f2cd8fd06d32844e7743bfa7494c3bfd7e"
  integrity sha512-USlDT524woQ08aoZFzh3/Z6ch9Y/EWXEHQ/AaRN0SkKq4t2Jw2R2339tSXmwuVoY7LLlBCbOIlx2myP/L5zk0g==

is-descriptor@^0.1.0:
  version "0.1.6"
  resolved "https://registry.yarnpkg.com/is-descriptor/-/is-descriptor-0.1.6.tgz#366d8240dde487ca51823b1ab9f07a10a78251ca"
  integrity sha512-avDYr0SB3DwO9zsMov0gKCESFYqCnE4hq/4z3TdUlukEy5t9C0YRq7HLrsN52NAcqXKaepeCD0n+B0arnVG3Hg==
  dependencies:
    is-accessor-descriptor "^0.1.6"
    is-data-descriptor "^0.1.4"
    kind-of "^5.0.0"

is-descriptor@^1.0.0, is-descriptor@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/is-descriptor/-/is-descriptor-1.0.2.tgz#3b159746a66604b04f8c81524ba365c5f14d86ec"
  integrity sha512-2eis5WqQGV7peooDyLmNEPUrps9+SXX5c9pL3xEB+4e9HnGuDa7mB7kHxHw4CbqS9k1T2hOH3miL8n8WtiYVtg==
  dependencies:
    is-accessor-descriptor "^1.0.0"
    is-data-descriptor "^1.0.0"
    kind-of "^6.0.2"

is-directory@^0.3.1:
  version "0.3.1"
  resolved "https://registry.yarnpkg.com/is-directory/-/is-directory-0.3.1.tgz#61339b6f2475fc772fd9c9d83f5c8575dc154ae1"
  integrity sha1-YTObbyR1/Hcv2cnYP1yFddwVSuE=

is-docker@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/is-docker/-/is-docker-2.0.0.tgz#2cb0df0e75e2d064fe1864c37cdeacb7b2dcf25b"
  integrity sha512-pJEdRugimx4fBMra5z2/5iRdZ63OhYV0vr0Dwm5+xtW4D1FvRkB8hamMIhnWfyJeDdyr/aa7BDyNbtG38VxgoQ==

is-extendable@^0.1.0, is-extendable@^0.1.1:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/is-extendable/-/is-extendable-0.1.1.tgz#62b110e289a471418e3ec36a617d472e301dfc89"
  integrity sha1-YrEQ4omkcUGOPsNqYX1HLjAd/Ik=

is-extendable@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/is-extendable/-/is-extendable-1.0.1.tgz#a7470f9e426733d81bd81e1155264e3a3507cab4"
  integrity sha512-arnXMxT1hhoKo9k1LZdmlNyJdDDfy2v0fXjFlmok4+i8ul/6WlbVge9bhM74OpNPQPMGUToDtz+KXa1PneJxOA==
  dependencies:
    is-plain-object "^2.0.4"

is-extglob@^2.1.0, is-extglob@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/is-extglob/-/is-extglob-2.1.1.tgz#a88c02535791f02ed37c76a1b9ea9773c833f8c2"
  integrity sha1-qIwCU1eR8C7TfHahueqXc8gz+MI=

is-fullwidth-code-point@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/is-fullwidth-code-point/-/is-fullwidth-code-point-1.0.0.tgz#ef9e31386f031a7f0d643af82fde50c457ef00cb"
  integrity sha1-754xOG8DGn8NZDr4L95QxFfvAMs=
  dependencies:
    number-is-nan "^1.0.0"

is-fullwidth-code-point@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/is-fullwidth-code-point/-/is-fullwidth-code-point-2.0.0.tgz#a3b30a5c4f199183167aaab93beefae3ddfb654f"
  integrity sha1-o7MKXE8ZkYMWeqq5O+764937ZU8=

is-fullwidth-code-point@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz#f116f8064fe90b3f7844a38997c0b75051269f1d"
  integrity sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==

is-generator-fn@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/is-generator-fn/-/is-generator-fn-2.1.0.tgz#7d140adc389aaf3011a8f2a2a4cfa6faadffb118"
  integrity sha512-cTIB4yPYL/Grw0EaSzASzg6bBy9gqCofvWN8okThAYIxKJZC+udlRAmGbM0XLeniEJSs8uEgHPGuHSe1XsOLSQ==

is-glob@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-3.1.0.tgz#7ba5ae24217804ac70707b96922567486cc3e84a"
  integrity sha1-e6WuJCF4BKxwcHuWkiVnSGzD6Eo=
  dependencies:
    is-extglob "^2.1.0"

is-glob@^4.0.0, is-glob@^4.0.1, is-glob@~4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/is-glob/-/is-glob-4.0.1.tgz#7567dbe9f2f5e2467bc77ab83c4a29482407a5dc"
  integrity sha512-5G0tKtBTFImOqDnLB2hG6Bp2qcKEFduo4tZu9MT/H6NQv/ghhy30o55ufafxJ/LdH79LLs2Kfrn85TLKyA7BUg==
  dependencies:
    is-extglob "^2.1.1"

is-number@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/is-number/-/is-number-3.0.0.tgz#24fd6201a4782cf50561c810276afc7d12d71195"
  integrity sha1-JP1iAaR4LPUFYcgQJ2r8fRLXEZU=
  dependencies:
    kind-of "^3.0.2"

is-number@^7.0.0:
  version "7.0.0"
  resolved "https://registry.yarnpkg.com/is-number/-/is-number-7.0.0.tgz#7535345b896734d5f80c4d06c50955527a14f12b"
  integrity sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==

is-obj@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/is-obj/-/is-obj-1.0.1.tgz#3e4729ac1f5fde025cd7d83a896dab9f4f67db0f"
  integrity sha1-PkcprB9f3gJc19g6iW2rn09n2w8=

is-obj@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/is-obj/-/is-obj-2.0.0.tgz#473fb05d973705e3fd9620545018ca8e22ef4982"
  integrity sha512-drqDG3cbczxxEJRoOXcOjtdp1J/lyp1mNn0xaznRs8+muBhgQcrnbspox5X5fOw0HnMnbfDzvnEMEtqDEJEo8w==

is-path-cwd@^2.0.0:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/is-path-cwd/-/is-path-cwd-2.2.0.tgz#67d43b82664a7b5191fd9119127eb300048a9fdb"
  integrity sha512-w942bTcih8fdJPJmQHFzkS76NEP8Kzzvmw92cXsazb8intwLqPibPPdXf4ANdKV3rYMuuQYGIWtvz9JilB3NFQ==

is-path-in-cwd@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/is-path-in-cwd/-/is-path-in-cwd-2.1.0.tgz#bfe2dca26c69f397265a4009963602935a053acb"
  integrity sha512-rNocXHgipO+rvnP6dk3zI20RpOtrAM/kzbB258Uw5BWr3TpXi861yzjo16Dn4hUox07iw5AyeMLHWsujkjzvRQ==
  dependencies:
    is-path-inside "^2.1.0"

is-path-inside@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/is-path-inside/-/is-path-inside-2.1.0.tgz#7c9810587d659a40d27bcdb4d5616eab059494b2"
  integrity sha512-wiyhTzfDWsvwAW53OBWF5zuvaOGlZ6PwYxAbPVDhpm+gM09xKQGjBq/8uYN12aDvMxnAnq3dxTyoSoRNmg5YFg==
  dependencies:
    path-is-inside "^1.0.2"

is-plain-obj@^1.0.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/is-plain-obj/-/is-plain-obj-1.1.0.tgz#71a50c8429dfca773c92a390a4a03b39fcd51d3e"
  integrity sha1-caUMhCnfync8kqOQpKA7OfzVHT4=

is-plain-object@^2.0.1, is-plain-object@^2.0.3, is-plain-object@^2.0.4:
  version "2.0.4"
  resolved "https://registry.yarnpkg.com/is-plain-object/-/is-plain-object-2.0.4.tgz#2c163b3fafb1b606d9d17928f05c2a1c38e07677"
  integrity sha512-h5PpgXkWitc38BBMYawTYMWJHFZJVnBquFE57xFpjB8pJFiF6gZ+bU+WyI/yqXiFR5mdLsgYNaPe8uao6Uv9Og==
  dependencies:
    isobject "^3.0.1"

is-promise@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/is-promise/-/is-promise-2.1.0.tgz#79a2a9ece7f096e80f36d2b2f3bc16c1ff4bf3fa"
  integrity sha1-eaKp7OfwlugPNtKy87wWwf9L8/o=

is-regex@^1.0.4, is-regex@^1.0.5:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/is-regex/-/is-regex-1.0.5.tgz#39d589a358bf18967f726967120b8fc1aed74eae"
  integrity sha512-vlKW17SNq44owv5AQR3Cq0bQPEb8+kF3UKZ2fiZNOWtztYE5i0CzCZxFDwO58qAOWtxdBRVO/V5Qin1wjCqFYQ==
  dependencies:
    has "^1.0.3"

is-regexp@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/is-regexp/-/is-regexp-1.0.0.tgz#fd2d883545c46bac5a633e7b9a09e87fa2cb5069"
  integrity sha1-/S2INUXEa6xaYz57mgnof6LLUGk=

is-resolvable@^1.0.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/is-resolvable/-/is-resolvable-1.1.0.tgz#fb18f87ce1feb925169c9a407c19318a3206ed88"
  integrity sha512-qgDYXFSR5WvEfuS5dMj6oTMEbrrSaM0CrFk2Yiq/gXnBvD9pMa2jGXxyhGLfvhZpuMZe18CJpFxAt3CRs42NMg==

is-root@2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/is-root/-/is-root-2.1.0.tgz#809e18129cf1129644302a4f8544035d51984a9c"
  integrity sha512-AGOriNp96vNBd3HtU+RzFEc75FfR5ymiYv8E553I71SCeXBiMsVDUtdio1OEFvrPyLIQ9tVR5RxXIFe5PUFjMg==

is-stream@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/is-stream/-/is-stream-1.1.0.tgz#12d4a3dd4e68e0b79ceb8dbc84173ae80d91ca44"
  integrity sha1-EtSj3U5o4Lec6428hBc66A2RykQ=

is-string@^1.0.5:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/is-string/-/is-string-1.0.5.tgz#40493ed198ef3ff477b8c7f92f644ec82a5cd3a6"
  integrity sha512-buY6VNRjhQMiF1qWDouloZlQbRhDPCebwxSjxMjxgemYT46YMd2NR0/H+fBhEfWX4A/w9TBJ+ol+okqJKFE6vQ==

is-svg@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/is-svg/-/is-svg-3.0.0.tgz#9321dbd29c212e5ca99c4fa9794c714bcafa2f75"
  integrity sha512-gi4iHK53LR2ujhLVVj+37Ykh9GLqYHX6JOVXbLAucaG/Cqw9xwdFOjDM2qeifLs1sF1npXXFvDu0r5HNgCMrzQ==
  dependencies:
    html-comment-regex "^1.1.0"

is-symbol@^1.0.2:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/is-symbol/-/is-symbol-1.0.3.tgz#38e1014b9e6329be0de9d24a414fd7441ec61937"
  integrity sha512-OwijhaRSgqvhm/0ZdAcXNZt9lYdKFpcRDT5ULUuYXPoT794UNOdU+gpT6Rzo7b4V2HUl/op6GqY894AZwv9faQ==
  dependencies:
    has-symbols "^1.0.1"

is-typedarray@~1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/is-typedarray/-/is-typedarray-1.0.0.tgz#e479c80858df0c1b11ddda6940f96011fcda4a9a"
  integrity sha1-5HnICFjfDBsR3dppQPlgEfzaSpo=

is-windows@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/is-windows/-/is-windows-1.0.2.tgz#d1850eb9791ecd18e6182ce12a30f396634bb19d"
  integrity sha512-eXK1UInq2bPmjyX6e3VHIzMLobc4J94i4AWn+Hpq3OU5KkrRC96OAcR3PRJ/pGu6m8TRnBHP9dkXQVsT/COVIA==

is-wsl@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/is-wsl/-/is-wsl-1.1.0.tgz#1f16e4aa22b04d1336b66188a66af3c600c3a66d"
  integrity sha1-HxbkqiKwTRM2tmGIpmrzxgDDpm0=

is-wsl@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/is-wsl/-/is-wsl-2.1.1.tgz#4a1c152d429df3d441669498e2486d3596ebaf1d"
  integrity sha512-umZHcSrwlDHo2TGMXv0DZ8dIUGunZ2Iv68YZnrmCiBPkZ4aaOhtv7pXJKeki9k3qJ3RJr0cDyitcl5wEH3AYog==

isarray@1.0.0, isarray@^1.0.0, isarray@~1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/isarray/-/isarray-1.0.0.tgz#bb935d48582cba168c06834957a54a3e07124f11"
  integrity sha1-u5NdSFgsuhaMBoNJV6VKPgcSTxE=

isexe@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/isexe/-/isexe-2.0.0.tgz#e8fbf374dc556ff8947a10dcb0572d633f2cfa10"
  integrity sha1-6PvzdNxVb/iUehDcsFctYz8s+hA=

isobject@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/isobject/-/isobject-2.1.0.tgz#f065561096a3f1da2ef46272f815c840d87e0c89"
  integrity sha1-8GVWEJaj8dou9GJy+BXIQNh+DIk=
  dependencies:
    isarray "1.0.0"

isobject@^3.0.0, isobject@^3.0.1:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/isobject/-/isobject-3.0.1.tgz#4e431e92b11a9731636aa1f9c8d1ccbcfdab78df"
  integrity sha1-TkMekrEalzFjaqH5yNHMvP2reN8=

isstream@~0.1.2:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/isstream/-/isstream-0.1.2.tgz#47e63f7af55afa6f92e1500e690eb8b8529c099a"
  integrity sha1-R+Y/evVa+m+S4VAOaQ64uFKcCZo=

istanbul-lib-coverage@^2.0.2, istanbul-lib-coverage@^2.0.5:
  version "2.0.5"
  resolved "https://registry.yarnpkg.com/istanbul-lib-coverage/-/istanbul-lib-coverage-2.0.5.tgz#675f0ab69503fad4b1d849f736baaca803344f49"
  integrity sha512-8aXznuEPCJvGnMSRft4udDRDtb1V3pkQkMMI5LI+6HuQz5oQ4J2UFn1H82raA3qJtyOLkkwVqICBQkjnGtn5mA==

istanbul-lib-instrument@^3.0.1, istanbul-lib-instrument@^3.3.0:
  version "3.3.0"
  resolved "https://registry.yarnpkg.com/istanbul-lib-instrument/-/istanbul-lib-instrument-3.3.0.tgz#a5f63d91f0bbc0c3e479ef4c5de027335ec6d630"
  integrity sha512-5nnIN4vo5xQZHdXno/YDXJ0G+I3dAm4XgzfSVTPLQpj/zAV2dV6Juy0yaf10/zrJOJeHoN3fraFe+XRq2bFVZA==
  dependencies:
    "@babel/generator" "^7.4.0"
    "@babel/parser" "^7.4.3"
    "@babel/template" "^7.4.0"
    "@babel/traverse" "^7.4.3"
    "@babel/types" "^7.4.0"
    istanbul-lib-coverage "^2.0.5"
    semver "^6.0.0"

istanbul-lib-report@^2.0.4:
  version "2.0.8"
  resolved "https://registry.yarnpkg.com/istanbul-lib-report/-/istanbul-lib-report-2.0.8.tgz#5a8113cd746d43c4889eba36ab10e7d50c9b4f33"
  integrity sha512-fHBeG573EIihhAblwgxrSenp0Dby6tJMFR/HvlerBsrCTD5bkUuoNtn3gVh29ZCS824cGGBPn7Sg7cNk+2xUsQ==
  dependencies:
    istanbul-lib-coverage "^2.0.5"
    make-dir "^2.1.0"
    supports-color "^6.1.0"

istanbul-lib-source-maps@^3.0.1:
  version "3.0.6"
  resolved "https://registry.yarnpkg.com/istanbul-lib-source-maps/-/istanbul-lib-source-maps-3.0.6.tgz#284997c48211752ec486253da97e3879defba8c8"
  integrity sha512-R47KzMtDJH6X4/YW9XTx+jrLnZnscW4VpNN+1PViSYTejLVPWv7oov+Duf8YQSPyVRUvueQqz1TcsC6mooZTXw==
  dependencies:
    debug "^4.1.1"
    istanbul-lib-coverage "^2.0.5"
    make-dir "^2.1.0"
    rimraf "^2.6.3"
    source-map "^0.6.1"

istanbul-reports@^2.2.6:
  version "2.2.7"
  resolved "https://registry.yarnpkg.com/istanbul-reports/-/istanbul-reports-2.2.7.tgz#5d939f6237d7b48393cc0959eab40cd4fd056931"
  integrity sha512-uu1F/L1o5Y6LzPVSVZXNOoD/KXpJue9aeLRd0sM9uMXfZvzomB0WxVamWb5ue8kA2vVWEmW7EG+A5n3f1kqHKg==
  dependencies:
    html-escaper "^2.0.0"

jest-changed-files@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-changed-files/-/jest-changed-files-24.9.0.tgz#08d8c15eb79a7fa3fc98269bc14b451ee82f8039"
  integrity sha512-6aTWpe2mHF0DhL28WjdkO8LyGjs3zItPET4bMSeXU6T3ub4FPMw+mcOcbdGXQOAfmLcxofD23/5Bl9Z4AkFwqg==
  dependencies:
    "@jest/types" "^24.9.0"
    execa "^1.0.0"
    throat "^4.0.0"

jest-cli@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-cli/-/jest-cli-24.9.0.tgz#ad2de62d07472d419c6abc301fc432b98b10d2af"
  integrity sha512-+VLRKyitT3BWoMeSUIHRxV/2g8y9gw91Jh5z2UmXZzkZKpbC08CSehVxgHUwTpy+HwGcns/tqafQDJW7imYvGg==
  dependencies:
    "@jest/core" "^24.9.0"
    "@jest/test-result" "^24.9.0"
    "@jest/types" "^24.9.0"
    chalk "^2.0.1"
    exit "^0.1.2"
    import-local "^2.0.0"
    is-ci "^2.0.0"
    jest-config "^24.9.0"
    jest-util "^24.9.0"
    jest-validate "^24.9.0"
    prompts "^2.0.1"
    realpath-native "^1.1.0"
    yargs "^13.3.0"

jest-config@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-config/-/jest-config-24.9.0.tgz#fb1bbc60c73a46af03590719efa4825e6e4dd1b5"
  integrity sha512-RATtQJtVYQrp7fvWg6f5y3pEFj9I+H8sWw4aKxnDZ96mob5i5SD6ZEGWgMLXQ4LE8UurrjbdlLWdUeo+28QpfQ==
  dependencies:
    "@babel/core" "^7.1.0"
    "@jest/test-sequencer" "^24.9.0"
    "@jest/types" "^24.9.0"
    babel-jest "^24.9.0"
    chalk "^2.0.1"
    glob "^7.1.1"
    jest-environment-jsdom "^24.9.0"
    jest-environment-node "^24.9.0"
    jest-get-type "^24.9.0"
    jest-jasmine2 "^24.9.0"
    jest-regex-util "^24.3.0"
    jest-resolve "^24.9.0"
    jest-util "^24.9.0"
    jest-validate "^24.9.0"
    micromatch "^3.1.10"
    pretty-format "^24.9.0"
    realpath-native "^1.1.0"

jest-diff@^24.0.0, jest-diff@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-diff/-/jest-diff-24.9.0.tgz#931b7d0d5778a1baf7452cb816e325e3724055da"
  integrity sha512-qMfrTs8AdJE2iqrTp0hzh7kTd2PQWrsFyj9tORoKmu32xjPjeE4NyjVRDz8ybYwqS2ik8N4hsIpiVTyFeo2lBQ==
  dependencies:
    chalk "^2.0.1"
    diff-sequences "^24.9.0"
    jest-get-type "^24.9.0"
    pretty-format "^24.9.0"

jest-docblock@^24.3.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-docblock/-/jest-docblock-24.9.0.tgz#7970201802ba560e1c4092cc25cbedf5af5a8ce2"
  integrity sha512-F1DjdpDMJMA1cN6He0FNYNZlo3yYmOtRUnktrT9Q37njYzC5WEaDdmbynIgy0L/IvXvvgsG8OsqhLPXTpfmZAA==
  dependencies:
    detect-newline "^2.1.0"

jest-each@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-each/-/jest-each-24.9.0.tgz#eb2da602e2a610898dbc5f1f6df3ba86b55f8b05"
  integrity sha512-ONi0R4BvW45cw8s2Lrx8YgbeXL1oCQ/wIDwmsM3CqM/nlblNCPmnC3IPQlMbRFZu3wKdQ2U8BqM6lh3LJ5Bsog==
  dependencies:
    "@jest/types" "^24.9.0"
    chalk "^2.0.1"
    jest-get-type "^24.9.0"
    jest-util "^24.9.0"
    pretty-format "^24.9.0"

jest-environment-jsdom-fourteen@1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/jest-environment-jsdom-fourteen/-/jest-environment-jsdom-fourteen-1.0.1.tgz#4cd0042f58b4ab666950d96532ecb2fc188f96fb"
  integrity sha512-DojMX1sY+at5Ep+O9yME34CdidZnO3/zfPh8UW+918C5fIZET5vCjfkegixmsi7AtdYfkr4bPlIzmWnlvQkP7Q==
  dependencies:
    "@jest/environment" "^24.3.0"
    "@jest/fake-timers" "^24.3.0"
    "@jest/types" "^24.3.0"
    jest-mock "^24.0.0"
    jest-util "^24.0.0"
    jsdom "^14.1.0"

jest-environment-jsdom@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-environment-jsdom/-/jest-environment-jsdom-24.9.0.tgz#4b0806c7fc94f95edb369a69cc2778eec2b7375b"
  integrity sha512-Zv9FV9NBRzLuALXjvRijO2351DRQeLYXtpD4xNvfoVFw21IOKNhZAEUKcbiEtjTkm2GsJ3boMVgkaR7rN8qetA==
  dependencies:
    "@jest/environment" "^24.9.0"
    "@jest/fake-timers" "^24.9.0"
    "@jest/types" "^24.9.0"
    jest-mock "^24.9.0"
    jest-util "^24.9.0"
    jsdom "^11.5.1"

jest-environment-node@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-environment-node/-/jest-environment-node-24.9.0.tgz#333d2d2796f9687f2aeebf0742b519f33c1cbfd3"
  integrity sha512-6d4V2f4nxzIzwendo27Tr0aFm+IXWa0XEUnaH6nU0FMaozxovt+sfRvh4J47wL1OvF83I3SSTu0XK+i4Bqe7uA==
  dependencies:
    "@jest/environment" "^24.9.0"
    "@jest/fake-timers" "^24.9.0"
    "@jest/types" "^24.9.0"
    jest-mock "^24.9.0"
    jest-util "^24.9.0"

jest-get-type@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-get-type/-/jest-get-type-24.9.0.tgz#1684a0c8a50f2e4901b6644ae861f579eed2ef0e"
  integrity sha512-lUseMzAley4LhIcpSP9Jf+fTrQ4a1yHQwLNeeVa2cEmbCGeoZAtYPOIv8JaxLD/sUpKxetKGP+gsHl8f8TSj8Q==

jest-haste-map@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-haste-map/-/jest-haste-map-24.9.0.tgz#b38a5d64274934e21fa417ae9a9fbeb77ceaac7d"
  integrity sha512-kfVFmsuWui2Sj1Rp1AJ4D9HqJwE4uwTlS/vO+eRUaMmd54BFpli2XhMQnPC2k4cHFVbB2Q2C+jtI1AGLgEnCjQ==
  dependencies:
    "@jest/types" "^24.9.0"
    anymatch "^2.0.0"
    fb-watchman "^2.0.0"
    graceful-fs "^4.1.15"
    invariant "^2.2.4"
    jest-serializer "^24.9.0"
    jest-util "^24.9.0"
    jest-worker "^24.9.0"
    micromatch "^3.1.10"
    sane "^4.0.3"
    walker "^1.0.7"
  optionalDependencies:
    fsevents "^1.2.7"

jest-jasmine2@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-jasmine2/-/jest-jasmine2-24.9.0.tgz#1f7b1bd3242c1774e62acabb3646d96afc3be6a0"
  integrity sha512-Cq7vkAgaYKp+PsX+2/JbTarrk0DmNhsEtqBXNwUHkdlbrTBLtMJINADf2mf5FkowNsq8evbPc07/qFO0AdKTzw==
  dependencies:
    "@babel/traverse" "^7.1.0"
    "@jest/environment" "^24.9.0"
    "@jest/test-result" "^24.9.0"
    "@jest/types" "^24.9.0"
    chalk "^2.0.1"
    co "^4.6.0"
    expect "^24.9.0"
    is-generator-fn "^2.0.0"
    jest-each "^24.9.0"
    jest-matcher-utils "^24.9.0"
    jest-message-util "^24.9.0"
    jest-runtime "^24.9.0"
    jest-snapshot "^24.9.0"
    jest-util "^24.9.0"
    pretty-format "^24.9.0"
    throat "^4.0.0"

jest-leak-detector@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-leak-detector/-/jest-leak-detector-24.9.0.tgz#b665dea7c77100c5c4f7dfcb153b65cf07dcf96a"
  integrity sha512-tYkFIDsiKTGwb2FG1w8hX9V0aUb2ot8zY/2nFg087dUageonw1zrLMP4W6zsRO59dPkTSKie+D4rhMuP9nRmrA==
  dependencies:
    jest-get-type "^24.9.0"
    pretty-format "^24.9.0"

jest-matcher-utils@^24.0.0, jest-matcher-utils@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-matcher-utils/-/jest-matcher-utils-24.9.0.tgz#f5b3661d5e628dffe6dd65251dfdae0e87c3a073"
  integrity sha512-OZz2IXsu6eaiMAwe67c1T+5tUAtQyQx27/EMEkbFAGiw52tB9em+uGbzpcgYVpA8wl0hlxKPZxrly4CXU/GjHA==
  dependencies:
    chalk "^2.0.1"
    jest-diff "^24.9.0"
    jest-get-type "^24.9.0"
    pretty-format "^24.9.0"

jest-message-util@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-message-util/-/jest-message-util-24.9.0.tgz#527f54a1e380f5e202a8d1149b0ec872f43119e3"
  integrity sha512-oCj8FiZ3U0hTP4aSui87P4L4jC37BtQwUMqk+zk/b11FR19BJDeZsZAvIHutWnmtw7r85UmR3CEWZ0HWU2mAlw==
  dependencies:
    "@babel/code-frame" "^7.0.0"
    "@jest/test-result" "^24.9.0"
    "@jest/types" "^24.9.0"
    "@types/stack-utils" "^1.0.1"
    chalk "^2.0.1"
    micromatch "^3.1.10"
    slash "^2.0.0"
    stack-utils "^1.0.1"

jest-mock@^24.0.0, jest-mock@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-mock/-/jest-mock-24.9.0.tgz#c22835541ee379b908673ad51087a2185c13f1c6"
  integrity sha512-3BEYN5WbSq9wd+SyLDES7AHnjH9A/ROBwmz7l2y+ol+NtSFO8DYiEBzoO1CeFc9a8DYy10EO4dDFVv/wN3zl1w==
  dependencies:
    "@jest/types" "^24.9.0"

jest-pnp-resolver@^1.2.1:
  version "1.2.1"
  resolved "https://registry.yarnpkg.com/jest-pnp-resolver/-/jest-pnp-resolver-1.2.1.tgz#ecdae604c077a7fbc70defb6d517c3c1c898923a"
  integrity sha512-pgFw2tm54fzgYvc/OHrnysABEObZCUNFnhjoRjaVOCN8NYc032/gVjPaHD4Aq6ApkSieWtfKAFQtmDKAmhupnQ==

jest-regex-util@^24.3.0, jest-regex-util@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-regex-util/-/jest-regex-util-24.9.0.tgz#c13fb3380bde22bf6575432c493ea8fe37965636"
  integrity sha512-05Cmb6CuxaA+Ys6fjr3PhvV3bGQmO+2p2La4hFbU+W5uOc479f7FdLXUWXw4pYMAhhSZIuKHwSXSu6CsSBAXQA==

jest-resolve-dependencies@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-resolve-dependencies/-/jest-resolve-dependencies-24.9.0.tgz#ad055198959c4cfba8a4f066c673a3f0786507ab"
  integrity sha512-Fm7b6AlWnYhT0BXy4hXpactHIqER7erNgIsIozDXWl5dVm+k8XdGVe1oTg1JyaFnOxarMEbax3wyRJqGP2Pq+g==
  dependencies:
    "@jest/types" "^24.9.0"
    jest-regex-util "^24.3.0"
    jest-snapshot "^24.9.0"

jest-resolve@24.9.0, jest-resolve@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-resolve/-/jest-resolve-24.9.0.tgz#dff04c7687af34c4dd7e524892d9cf77e5d17321"
  integrity sha512-TaLeLVL1l08YFZAt3zaPtjiVvyy4oSA6CRe+0AFPPVX3Q/VI0giIWWoAvoS5L96vj9Dqxj4fB5p2qrHCmTU/MQ==
  dependencies:
    "@jest/types" "^24.9.0"
    browser-resolve "^1.11.3"
    chalk "^2.0.1"
    jest-pnp-resolver "^1.2.1"
    realpath-native "^1.1.0"

jest-runner@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-runner/-/jest-runner-24.9.0.tgz#574fafdbd54455c2b34b4bdf4365a23857fcdf42"
  integrity sha512-KksJQyI3/0mhcfspnxxEOBueGrd5E4vV7ADQLT9ESaCzz02WnbdbKWIf5Mkaucoaj7obQckYPVX6JJhgUcoWWg==
  dependencies:
    "@jest/console" "^24.7.1"
    "@jest/environment" "^24.9.0"
    "@jest/test-result" "^24.9.0"
    "@jest/types" "^24.9.0"
    chalk "^2.4.2"
    exit "^0.1.2"
    graceful-fs "^4.1.15"
    jest-config "^24.9.0"
    jest-docblock "^24.3.0"
    jest-haste-map "^24.9.0"
    jest-jasmine2 "^24.9.0"
    jest-leak-detector "^24.9.0"
    jest-message-util "^24.9.0"
    jest-resolve "^24.9.0"
    jest-runtime "^24.9.0"
    jest-util "^24.9.0"
    jest-worker "^24.6.0"
    source-map-support "^0.5.6"
    throat "^4.0.0"

jest-runtime@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-runtime/-/jest-runtime-24.9.0.tgz#9f14583af6a4f7314a6a9d9f0226e1a781c8e4ac"
  integrity sha512-8oNqgnmF3v2J6PVRM2Jfuj8oX3syKmaynlDMMKQ4iyzbQzIG6th5ub/lM2bCMTmoTKM3ykcUYI2Pw9xwNtjMnw==
  dependencies:
    "@jest/console" "^24.7.1"
    "@jest/environment" "^24.9.0"
    "@jest/source-map" "^24.3.0"
    "@jest/transform" "^24.9.0"
    "@jest/types" "^24.9.0"
    "@types/yargs" "^13.0.0"
    chalk "^2.0.1"
    exit "^0.1.2"
    glob "^7.1.3"
    graceful-fs "^4.1.15"
    jest-config "^24.9.0"
    jest-haste-map "^24.9.0"
    jest-message-util "^24.9.0"
    jest-mock "^24.9.0"
    jest-regex-util "^24.3.0"
    jest-resolve "^24.9.0"
    jest-snapshot "^24.9.0"
    jest-util "^24.9.0"
    jest-validate "^24.9.0"
    realpath-native "^1.1.0"
    slash "^2.0.0"
    strip-bom "^3.0.0"
    yargs "^13.3.0"

jest-serializer@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-serializer/-/jest-serializer-24.9.0.tgz#e6d7d7ef96d31e8b9079a714754c5d5c58288e73"
  integrity sha512-DxYipDr8OvfrKH3Kel6NdED3OXxjvxXZ1uIY2I9OFbGg+vUkkg7AGvi65qbhbWNPvDckXmzMPbK3u3HaDO49bQ==

jest-snapshot@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-snapshot/-/jest-snapshot-24.9.0.tgz#ec8e9ca4f2ec0c5c87ae8f925cf97497b0e951ba"
  integrity sha512-uI/rszGSs73xCM0l+up7O7a40o90cnrk429LOiK3aeTvfC0HHmldbd81/B7Ix81KSFe1lwkbl7GnBGG4UfuDew==
  dependencies:
    "@babel/types" "^7.0.0"
    "@jest/types" "^24.9.0"
    chalk "^2.0.1"
    expect "^24.9.0"
    jest-diff "^24.9.0"
    jest-get-type "^24.9.0"
    jest-matcher-utils "^24.9.0"
    jest-message-util "^24.9.0"
    jest-resolve "^24.9.0"
    mkdirp "^0.5.1"
    natural-compare "^1.4.0"
    pretty-format "^24.9.0"
    semver "^6.2.0"

jest-util@^24.0.0, jest-util@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-util/-/jest-util-24.9.0.tgz#7396814e48536d2e85a37de3e4c431d7cb140162"
  integrity sha512-x+cZU8VRmOJxbA1K5oDBdxQmdq0OIdADarLxk0Mq+3XS4jgvhG/oKGWcIDCtPG0HgjxOYvF+ilPJQsAyXfbNOg==
  dependencies:
    "@jest/console" "^24.9.0"
    "@jest/fake-timers" "^24.9.0"
    "@jest/source-map" "^24.9.0"
    "@jest/test-result" "^24.9.0"
    "@jest/types" "^24.9.0"
    callsites "^3.0.0"
    chalk "^2.0.1"
    graceful-fs "^4.1.15"
    is-ci "^2.0.0"
    mkdirp "^0.5.1"
    slash "^2.0.0"
    source-map "^0.6.0"

jest-validate@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-validate/-/jest-validate-24.9.0.tgz#0775c55360d173cd854e40180756d4ff52def8ab"
  integrity sha512-HPIt6C5ACwiqSiwi+OfSSHbK8sG7akG8eATl+IPKaeIjtPOeBUd/g3J7DghugzxrGjI93qS/+RPKe1H6PqvhRQ==
  dependencies:
    "@jest/types" "^24.9.0"
    camelcase "^5.3.1"
    chalk "^2.0.1"
    jest-get-type "^24.9.0"
    leven "^3.1.0"
    pretty-format "^24.9.0"

jest-watch-typeahead@0.4.2:
  version "0.4.2"
  resolved "https://registry.yarnpkg.com/jest-watch-typeahead/-/jest-watch-typeahead-0.4.2.tgz#e5be959698a7fa2302229a5082c488c3c8780a4a"
  integrity sha512-f7VpLebTdaXs81rg/oj4Vg/ObZy2QtGzAmGLNsqUS5G5KtSN68tFcIsbvNODfNyQxU78g7D8x77o3bgfBTR+2Q==
  dependencies:
    ansi-escapes "^4.2.1"
    chalk "^2.4.1"
    jest-regex-util "^24.9.0"
    jest-watcher "^24.3.0"
    slash "^3.0.0"
    string-length "^3.1.0"
    strip-ansi "^5.0.0"

jest-watcher@^24.3.0, jest-watcher@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-watcher/-/jest-watcher-24.9.0.tgz#4b56e5d1ceff005f5b88e528dc9afc8dd4ed2b3b"
  integrity sha512-+/fLOfKPXXYJDYlks62/4R4GoT+GU1tYZed99JSCOsmzkkF7727RqKrjNAxtfO4YpGv11wybgRvCjR73lK2GZw==
  dependencies:
    "@jest/test-result" "^24.9.0"
    "@jest/types" "^24.9.0"
    "@types/yargs" "^13.0.0"
    ansi-escapes "^3.0.0"
    chalk "^2.0.1"
    jest-util "^24.9.0"
    string-length "^2.0.0"

jest-worker@^24.6.0, jest-worker@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest-worker/-/jest-worker-24.9.0.tgz#5dbfdb5b2d322e98567898238a9697bcce67b3e5"
  integrity sha512-51PE4haMSXcHohnSMdM42anbvZANYTqMrr52tVKPqqsPJMzoP6FYYDVqahX/HrAoKEKz3uUPzSvKs9A3qR4iVw==
  dependencies:
    merge-stream "^2.0.0"
    supports-color "^6.1.0"

jest-worker@^25.1.0:
  version "25.1.0"
  resolved "https://registry.yarnpkg.com/jest-worker/-/jest-worker-25.1.0.tgz#75d038bad6fdf58eba0d2ec1835856c497e3907a"
  integrity sha512-ZHhHtlxOWSxCoNOKHGbiLzXnl42ga9CxDr27H36Qn+15pQZd3R/F24jrmjDelw9j/iHUIWMWs08/u2QN50HHOg==
  dependencies:
    merge-stream "^2.0.0"
    supports-color "^7.0.0"

jest@24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/jest/-/jest-24.9.0.tgz#987d290c05a08b52c56188c1002e368edb007171"
  integrity sha512-YvkBL1Zm7d2B1+h5fHEOdyjCG+sGMz4f8D86/0HiqJ6MB4MnDc8FgP5vdWsGnemOQro7lnYo8UakZ3+5A0jxGw==
  dependencies:
    import-local "^2.0.0"
    jest-cli "^24.9.0"

"js-tokens@^3.0.0 || ^4.0.0", js-tokens@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/js-tokens/-/js-tokens-4.0.0.tgz#19203fb59991df98e3a287050d4647cdeaf32499"
  integrity sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ==

js-tokens@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/js-tokens/-/js-tokens-3.0.2.tgz#9866df395102130e38f7f996bceb65443209c25b"
  integrity sha1-mGbfOVECEw449/mWvOtlRDIJwls=

js-yaml@^3.13.1:
  version "3.13.1"
  resolved "https://registry.yarnpkg.com/js-yaml/-/js-yaml-3.13.1.tgz#aff151b30bfdfa8e49e05da22e7415e9dfa37847"
  integrity sha512-YfbcO7jXDdyj0DGxYVSlSeQNHbD7XPWvrVWeVUujrQEoZzWJIRrCPoyk6kL6IAjAG2IolMK4T0hNUe0HOUs5Jw==
  dependencies:
    argparse "^1.0.7"
    esprima "^4.0.0"

jsbn@~0.1.0:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/jsbn/-/jsbn-0.1.1.tgz#a5e654c2e5a2deb5f201d96cefbca80c0ef2f513"
  integrity sha1-peZUwuWi3rXyAdls77yoDA7y9RM=

jsdom@^11.5.1:
  version "11.12.0"
  resolved "https://registry.yarnpkg.com/jsdom/-/jsdom-11.12.0.tgz#1a80d40ddd378a1de59656e9e6dc5a3ba8657bc8"
  integrity sha512-y8Px43oyiBM13Zc1z780FrfNLJCXTL40EWlty/LXUtcjykRBNgLlCjWXpfSPBl2iv+N7koQN+dvqszHZgT/Fjw==
  dependencies:
    abab "^2.0.0"
    acorn "^5.5.3"
    acorn-globals "^4.1.0"
    array-equal "^1.0.0"
    cssom ">= 0.3.2 < 0.4.0"
    cssstyle "^1.0.0"
    data-urls "^1.0.0"
    domexception "^1.0.1"
    escodegen "^1.9.1"
    html-encoding-sniffer "^1.0.2"
    left-pad "^1.3.0"
    nwsapi "^2.0.7"
    parse5 "4.0.0"
    pn "^1.1.0"
    request "^2.87.0"
    request-promise-native "^1.0.5"
    sax "^1.2.4"
    symbol-tree "^3.2.2"
    tough-cookie "^2.3.4"
    w3c-hr-time "^1.0.1"
    webidl-conversions "^4.0.2"
    whatwg-encoding "^1.0.3"
    whatwg-mimetype "^2.1.0"
    whatwg-url "^6.4.1"
    ws "^5.2.0"
    xml-name-validator "^3.0.0"

jsdom@^14.1.0:
  version "14.1.0"
  resolved "https://registry.yarnpkg.com/jsdom/-/jsdom-14.1.0.tgz#916463b6094956b0a6c1782c94e380cd30e1981b"
  integrity sha512-O901mfJSuTdwU2w3Sn+74T+RnDVP+FuV5fH8tcPWyqrseRAb0s5xOtPgCFiPOtLcyK7CLIJwPyD83ZqQWvA5ng==
  dependencies:
    abab "^2.0.0"
    acorn "^6.0.4"
    acorn-globals "^4.3.0"
    array-equal "^1.0.0"
    cssom "^0.3.4"
    cssstyle "^1.1.1"
    data-urls "^1.1.0"
    domexception "^1.0.1"
    escodegen "^1.11.0"
    html-encoding-sniffer "^1.0.2"
    nwsapi "^2.1.3"
    parse5 "5.1.0"
    pn "^1.1.0"
    request "^2.88.0"
    request-promise-native "^1.0.5"
    saxes "^3.1.9"
    symbol-tree "^3.2.2"
    tough-cookie "^2.5.0"
    w3c-hr-time "^1.0.1"
    w3c-xmlserializer "^1.1.2"
    webidl-conversions "^4.0.2"
    whatwg-encoding "^1.0.5"
    whatwg-mimetype "^2.3.0"
    whatwg-url "^7.0.0"
    ws "^6.1.2"
    xml-name-validator "^3.0.0"

jsesc@^2.5.1:
  version "2.5.2"
  resolved "https://registry.yarnpkg.com/jsesc/-/jsesc-2.5.2.tgz#80564d2e483dacf6e8ef209650a67df3f0c283a4"
  integrity sha512-OYu7XEzjkCQ3C5Ps3QIZsQfNpqoJyZZA99wd9aWd05NCtC5pWOkShK2mkL6HXQR6/Cy2lbNdPlZBpuQHXE63gA==

jsesc@~0.5.0:
  version "0.5.0"
  resolved "https://registry.yarnpkg.com/jsesc/-/jsesc-0.5.0.tgz#e7dee66e35d6fc16f710fe91d5cf69f70f08911d"
  integrity sha1-597mbjXW/Bb3EP6R1c9p9w8IkR0=

json-parse-better-errors@^1.0.1, json-parse-better-errors@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/json-parse-better-errors/-/json-parse-better-errors-1.0.2.tgz#bb867cfb3450e69107c131d1c514bab3dc8bcaa9"
  integrity sha512-mrqyZKfX5EhL7hvqcV6WG1yYjnjeuYDzDhhcAAUrq8Po85NBQBJP+ZDUT75qZQ98IkUoBqdkExkukOU7Ts2wrw==

json-schema-traverse@^0.4.1:
  version "0.4.1"
  resolved "https://registry.yarnpkg.com/json-schema-traverse/-/json-schema-traverse-0.4.1.tgz#69f6a87d9513ab8bb8fe63bdb0979c448e684660"
  integrity sha512-xbbCH5dCYU5T8LcEhhuh7HJ88HXuW3qsI3Y0zOZFKfZEHcpWiHU/Jxzk629Brsab/mMiHQti9wMP+845RPe3Vg==

json-schema@0.2.3:
  version "0.2.3"
  resolved "https://registry.yarnpkg.com/json-schema/-/json-schema-0.2.3.tgz#b480c892e59a2f05954ce727bd3f2a4e882f9e13"
  integrity sha1-tIDIkuWaLwWVTOcnvT8qTogvnhM=

json-stable-stringify-without-jsonify@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/json-stable-stringify-without-jsonify/-/json-stable-stringify-without-jsonify-1.0.1.tgz#9db7b59496ad3f3cfef30a75142d2d930ad72651"
  integrity sha1-nbe1lJatPzz+8wp1FC0tkwrXJlE=

json-stable-stringify@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/json-stable-stringify/-/json-stable-stringify-1.0.1.tgz#9a759d39c5f2ff503fd5300646ed445f88c4f9af"
  integrity sha1-mnWdOcXy/1A/1TAGRu1EX4jE+a8=
  dependencies:
    jsonify "~0.0.0"

json-stringify-safe@~5.0.1:
  version "5.0.1"
  resolved "https://registry.yarnpkg.com/json-stringify-safe/-/json-stringify-safe-5.0.1.tgz#1296a2d58fd45f19a0f6ce01d65701e2c735b6eb"
  integrity sha1-Epai1Y/UXxmg9s4B1lcB4sc1tus=

json3@^3.3.2:
  version "3.3.3"
  resolved "https://registry.yarnpkg.com/json3/-/json3-3.3.3.tgz#7fc10e375fc5ae42c4705a5cc0aa6f62be305b81"
  integrity sha512-c7/8mbUsKigAbLkD5B010BK4D9LZm7A1pNItkEwiUZRpIN66exu/e7YQWysGun+TRKaJp8MhemM+VkfWv42aCA==

json5@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/json5/-/json5-1.0.1.tgz#779fb0018604fa854eacbf6252180d83543e3dbe"
  integrity sha512-aKS4WQjPenRxiQsC93MNfjx+nbF4PAdYzmd/1JIj8HYzqfbu86beTuNgXDzPknWk0n0uARlyewZo4s++ES36Ow==
  dependencies:
    minimist "^1.2.0"

json5@^2.1.2:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/json5/-/json5-2.1.2.tgz#43ef1f0af9835dd624751a6b7fa48874fb2d608e"
  integrity sha512-MoUOQ4WdiN3yxhm7NEVJSJrieAo5hNSLQ5sj05OTRHPL9HOBy8u4Bu88jsC1jvqAdN+E1bJmsUcZH+1HQxliqQ==
  dependencies:
    minimist "^1.2.5"

jsonfile@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/jsonfile/-/jsonfile-4.0.0.tgz#8771aae0799b64076b76640fca058f9c10e33ecb"
  integrity sha1-h3Gq4HmbZAdrdmQPygWPnBDjPss=
  optionalDependencies:
    graceful-fs "^4.1.6"

jsonify@~0.0.0:
  version "0.0.0"
  resolved "https://registry.yarnpkg.com/jsonify/-/jsonify-0.0.0.tgz#2c74b6ee41d93ca51b7b5aaee8f503631d252a73"
  integrity sha1-LHS27kHZPKUbe1qu6PUDYx0lKnM=

jsprim@^1.2.2:
  version "1.4.1"
  resolved "https://registry.yarnpkg.com/jsprim/-/jsprim-1.4.1.tgz#313e66bc1e5cc06e438bc1b7499c2e5c56acb6a2"
  integrity sha1-MT5mvB5cwG5Di8G3SZwuXFastqI=
  dependencies:
    assert-plus "1.0.0"
    extsprintf "1.3.0"
    json-schema "0.2.3"
    verror "1.10.0"

jsx-ast-utils@^2.2.1, jsx-ast-utils@^2.2.3:
  version "2.2.3"
  resolved "https://registry.yarnpkg.com/jsx-ast-utils/-/jsx-ast-utils-2.2.3.tgz#8a9364e402448a3ce7f14d357738310d9248054f"
  integrity sha512-EdIHFMm+1BPynpKOpdPqiOsvnIrInRGJD7bzPZdPkjitQEqpdpUuFpq4T0npZFKTiB3RhWFdGN+oqOJIdhDhQA==
  dependencies:
    array-includes "^3.0.3"
    object.assign "^4.1.0"

killable@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/killable/-/killable-1.0.1.tgz#4c8ce441187a061c7474fb87ca08e2a638194892"
  integrity sha512-LzqtLKlUwirEUyl/nicirVmNiPvYs7l5n8wOPP7fyJVpUPkvCnW/vuiXGpylGUlnPDnB7311rARzAt3Mhswpjg==

kind-of@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-2.0.1.tgz#018ec7a4ce7e3a86cb9141be519d24c8faa981b5"
  integrity sha1-AY7HpM5+OobLkUG+UZ0kyPqpgbU=
  dependencies:
    is-buffer "^1.0.2"

kind-of@^3.0.2, kind-of@^3.0.3, kind-of@^3.2.0:
  version "3.2.2"
  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-3.2.2.tgz#31ea21a734bab9bbb0f32466d893aea51e4a3c64"
  integrity sha1-MeohpzS6ubuw8yRm2JOupR5KPGQ=
  dependencies:
    is-buffer "^1.1.5"

kind-of@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-4.0.0.tgz#20813df3d712928b207378691a45066fae72dd57"
  integrity sha1-IIE989cSkosgc3hpGkUGb65y3Vc=
  dependencies:
    is-buffer "^1.1.5"

kind-of@^5.0.0:
  version "5.1.0"
  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-5.1.0.tgz#729c91e2d857b7a419a1f9aa65685c4c33f5845d"
  integrity sha512-NGEErnH6F2vUuXDh+OlbcKW7/wOcfdRHaZ7VWtqCztfHri/++YKmP51OdWeGPuqCOba6kk2OTe5d02VmTB80Pw==

kind-of@^6.0.0, kind-of@^6.0.2:
  version "6.0.3"
  resolved "https://registry.yarnpkg.com/kind-of/-/kind-of-6.0.3.tgz#07c05034a6c349fa06e24fa35aa76db4580ce4dd"
  integrity sha512-dcS1ul+9tmeD95T+x28/ehLgd9mENa3LsvDTtzm3vyBEO7RPptvAD+t44WVXaUjTBRcrpFeFlC8WCruUR456hw==

kleur@^3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/kleur/-/kleur-3.0.3.tgz#a79c9ecc86ee1ce3fa6206d1216c501f147fc07e"
  integrity sha512-eTIzlVOSUR+JxdDFepEYcBMtZ9Qqdef+rnzWdRZuMbOywu5tO2w2N7rqjoANZ5k9vywhL6Br1VRjUIgTQx4E8w==

last-call-webpack-plugin@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/last-call-webpack-plugin/-/last-call-webpack-plugin-3.0.0.tgz#9742df0e10e3cf46e5c0381c2de90d3a7a2d7555"
  integrity sha512-7KI2l2GIZa9p2spzPIVZBYyNKkN+e/SQPpnjlTiPhdbDW3F86tdKKELxKpzJ5sgU19wQWsACULZmpTPYHeWO5w==
  dependencies:
    lodash "^4.17.5"
    webpack-sources "^1.1.0"

lazy-cache@^0.2.3:
  version "0.2.7"
  resolved "https://registry.yarnpkg.com/lazy-cache/-/lazy-cache-0.2.7.tgz#7feddf2dcb6edb77d11ef1d117ab5ffdf0ab1b65"
  integrity sha1-f+3fLctu23fRHvHRF6tf/fCrG2U=

lazy-cache@^1.0.3:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/lazy-cache/-/lazy-cache-1.0.4.tgz#a1d78fc3a50474cb80845d3b3b6e1da49a446e8e"
  integrity sha1-odePw6UEdMuAhF07O24dpJpEbo4=

lcid@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/lcid/-/lcid-2.0.0.tgz#6ef5d2df60e52f82eb228a4c373e8d1f397253cf"
  integrity sha512-avPEb8P8EGnwXKClwsNUgryVjllcRqtMYa49NTsbQagYuT1DcXnl1915oxWjoyGrXR6zH/Y0Zc96xWsPcoDKeA==
  dependencies:
    invert-kv "^2.0.0"

left-pad@^1.3.0:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/left-pad/-/left-pad-1.3.0.tgz#5b8a3a7765dfe001261dde915589e782f8c94d1e"
  integrity sha512-XI5MPzVNApjAyhQzphX8BkmKsKUxD4LdyK24iZeQGinBN9yTQT3bFlCBy/aVx2HrNcqQGsdot8ghrjyrvMCoEA==

leven@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/leven/-/leven-3.1.0.tgz#77891de834064cccba82ae7842bb6b14a13ed7f2"
  integrity sha512-qsda+H8jTaUaN/x5vzW2rzc+8Rw4TAQ/4KjB46IwK5VH+IlVeeeje/EoZRpiXvIqjFgK84QffqPztGI3VBLG1A==

levenary@^1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/levenary/-/levenary-1.1.1.tgz#842a9ee98d2075aa7faeedbe32679e9205f46f77"
  integrity sha512-mkAdOIt79FD6irqjYSs4rdbnlT5vRonMEvBVPVb3XmevfS8kgRXwfes0dhPdEtzTWD/1eNE/Bm/G1iRt6DcnQQ==
  dependencies:
    leven "^3.1.0"

levn@^0.3.0, levn@~0.3.0:
  version "0.3.0"
  resolved "https://registry.yarnpkg.com/levn/-/levn-0.3.0.tgz#3b09924edf9f083c0490fdd4c0bc4421e04764ee"
  integrity sha1-OwmSTt+fCDwEkP3UwLxEIeBHZO4=
  dependencies:
    prelude-ls "~1.1.2"
    type-check "~0.3.2"

lines-and-columns@^1.1.6:
  version "1.1.6"
  resolved "https://registry.yarnpkg.com/lines-and-columns/-/lines-and-columns-1.1.6.tgz#1c00c743b433cd0a4e80758f7b64a57440d9ff00"
  integrity sha1-HADHQ7QzzQpOgHWPe2SldEDZ/wA=

load-json-file@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/load-json-file/-/load-json-file-2.0.0.tgz#7947e42149af80d696cbf797bcaabcfe1fe29ca8"
  integrity sha1-eUfkIUmvgNaWy/eXvKq8/h/inKg=
  dependencies:
    graceful-fs "^4.1.2"
    parse-json "^2.2.0"
    pify "^2.0.0"
    strip-bom "^3.0.0"

load-json-file@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/load-json-file/-/load-json-file-4.0.0.tgz#2f5f45ab91e33216234fd53adab668eb4ec0993b"
  integrity sha1-L19Fq5HjMhYjT9U62rZo607AmTs=
  dependencies:
    graceful-fs "^4.1.2"
    parse-json "^4.0.0"
    pify "^3.0.0"
    strip-bom "^3.0.0"

loader-fs-cache@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/loader-fs-cache/-/loader-fs-cache-1.0.2.tgz#54cedf6b727e1779fd8f01205f05f6e88706f086"
  integrity sha512-70IzT/0/L+M20jUlEqZhZyArTU6VKLRTYRDAYN26g4jfzpJqjipLL3/hgYpySqI9PwsVRHHFja0LfEmsx9X2Cw==
  dependencies:
    find-cache-dir "^0.1.1"
    mkdirp "0.5.1"

loader-runner@^2.4.0:
  version "2.4.0"
  resolved "https://registry.yarnpkg.com/loader-runner/-/loader-runner-2.4.0.tgz#ed47066bfe534d7e84c4c7b9998c2a75607d9357"
  integrity sha512-Jsmr89RcXGIwivFY21FcRrisYZfvLMTWx5kOLc+JTxtpBOG6xML0vzbc6SEQG2FO9/4Fc3wW4LVcB5DmGflaRw==

loader-utils@1.2.3:
  version "1.2.3"
  resolved "https://registry.yarnpkg.com/loader-utils/-/loader-utils-1.2.3.tgz#1ff5dc6911c9f0a062531a4c04b609406108c2c7"
  integrity sha512-fkpz8ejdnEMG3s37wGL07iSBDg99O9D5yflE9RGNH3hRdx9SOwYfnGYdZOUIZitN8E+E2vkq3MUMYMvPYl5ZZA==
  dependencies:
    big.js "^5.2.2"
    emojis-list "^2.0.0"
    json5 "^1.0.1"

loader-utils@^1.1.0, loader-utils@^1.2.3, loader-utils@^1.4.0:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/loader-utils/-/loader-utils-1.4.0.tgz#c579b5e34cb34b1a74edc6c1fb36bfa371d5a613"
  integrity sha512-qH0WSMBtn/oHuwjy/NucEgbx5dbxxnxup9s4PVXJUDHZBQY+s0NWA9rJf53RBnQZxfch7euUui7hpoAPvALZdA==
  dependencies:
    big.js "^5.2.2"
    emojis-list "^3.0.0"
    json5 "^1.0.1"

locate-path@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/locate-path/-/locate-path-2.0.0.tgz#2b568b265eec944c6d9c0de9c3dbbbca0354cd8e"
  integrity sha1-K1aLJl7slExtnA3pw9u7ygNUzY4=
  dependencies:
    p-locate "^2.0.0"
    path-exists "^3.0.0"

locate-path@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/locate-path/-/locate-path-3.0.0.tgz#dbec3b3ab759758071b58fe59fc41871af21400e"
  integrity sha512-7AO748wWnIhNqAuaty2ZWHkQHRSNfPVIsPIfwEOWO22AmaoVrWavlOcMR5nzTLNYvp36X220/maaRsrec1G65A==
  dependencies:
    p-locate "^3.0.0"
    path-exists "^3.0.0"

locate-path@^5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/locate-path/-/locate-path-5.0.0.tgz#1afba396afd676a6d42504d0a67a3a7eb9f62aa0"
  integrity sha512-t7hw9pI+WvuwNJXwk5zVHpyhIqzg2qTlklJOf0mVxGSbe3Fp2VieZcduNYjaLDoy6p9uGpQEGWG87WpMKlNq8g==
  dependencies:
    p-locate "^4.1.0"

lodash._reinterpolate@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/lodash._reinterpolate/-/lodash._reinterpolate-3.0.0.tgz#0ccf2d89166af03b3663c796538b75ac6e114d9d"
  integrity sha1-DM8tiRZq8Ds2Y8eWU4t1rG4RTZ0=

lodash.memoize@^4.1.2:
  version "4.1.2"
  resolved "https://registry.yarnpkg.com/lodash.memoize/-/lodash.memoize-4.1.2.tgz#bcc6c49a42a2840ed997f323eada5ecd182e0bfe"
  integrity sha1-vMbEmkKihA7Zl/Mj6tpezRguC/4=

lodash.sortby@^4.7.0:
  version "4.7.0"
  resolved "https://registry.yarnpkg.com/lodash.sortby/-/lodash.sortby-4.7.0.tgz#edd14c824e2cc9c1e0b0a1b42bb5210516a42438"
  integrity sha1-7dFMgk4sycHgsKG0K7UhBRakJDg=

lodash.template@^4.4.0, lodash.template@^4.5.0:
  version "4.5.0"
  resolved "https://registry.yarnpkg.com/lodash.template/-/lodash.template-4.5.0.tgz#f976195cf3f347d0d5f52483569fe8031ccce8ab"
  integrity sha512-84vYFxIkmidUiFxidA/KjjH9pAycqW+h980j7Fuz5qxRtO9pgB7MDFTdys1N7A5mcucRiDyEq4fusljItR1T/A==
  dependencies:
    lodash._reinterpolate "^3.0.0"
    lodash.templatesettings "^4.0.0"

lodash.templatesettings@^4.0.0:
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/lodash.templatesettings/-/lodash.templatesettings-4.2.0.tgz#e481310f049d3cf6d47e912ad09313b154f0fb33"
  integrity sha512-stgLz+i3Aa9mZgnjr/O+v9ruKZsPsndy7qPZOchbqk2cnTU1ZaldKK+v7m54WoKIyxiuMZTKT2H81F8BeAc3ZQ==
  dependencies:
    lodash._reinterpolate "^3.0.0"

lodash.uniq@^4.5.0:
  version "4.5.0"
  resolved "https://registry.yarnpkg.com/lodash.uniq/-/lodash.uniq-4.5.0.tgz#d0225373aeb652adc1bc82e4945339a842754773"
  integrity sha1-0CJTc662Uq3BvILklFM5qEJ1R3M=

"lodash@>=3.5 <5", lodash@^4.17.11, lodash@^4.17.13, lodash@^4.17.14, lodash@^4.17.15, lodash@^4.17.5:
  version "4.17.15"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.15.tgz#b447f6670a0455bbfeedd11392eff330ea097548"
  integrity sha512-8xOcRHvCjnocdS5cpwXQXVzmmh5e5+saE2QGoeQmbKmRS6J3VQppPOIt0MnmE+4xlZoumy0GPG0D0MVIQbNA1A==

loglevel@^1.6.6:
  version "1.6.7"
  resolved "https://registry.yarnpkg.com/loglevel/-/loglevel-1.6.7.tgz#b3e034233188c68b889f5b862415306f565e2c56"
  integrity sha512-cY2eLFrQSAfVPhCgH1s7JI73tMbg9YC3v3+ZHVW67sBS7UxWzNEk/ZBbSfLykBWHp33dqqtOv82gjhKEi81T/A==

loose-envify@^1.0.0, loose-envify@^1.1.0, loose-envify@^1.4.0:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/loose-envify/-/loose-envify-1.4.0.tgz#71ee51fa7be4caec1a63839f7e682d8132d30caf"
  integrity sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==
  dependencies:
    js-tokens "^3.0.0 || ^4.0.0"

lower-case@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/lower-case/-/lower-case-2.0.1.tgz#39eeb36e396115cc05e29422eaea9e692c9408c7"
  integrity sha512-LiWgfDLLb1dwbFQZsSglpRj+1ctGnayXz3Uv0/WO8n558JycT5fg6zkNcnW0G68Nn0aEldTFeEfmjCfmqry/rQ==
  dependencies:
    tslib "^1.10.0"

lru-cache@^5.1.1:
  version "5.1.1"
  resolved "https://registry.yarnpkg.com/lru-cache/-/lru-cache-5.1.1.tgz#1da27e6710271947695daf6848e847f01d84b920"
  integrity sha512-KpNARQA3Iwv+jTA0utUVVbrh+Jlrr1Fv0e56GGzAFOXN7dk/FviaDW8LHmK52DlcH4WP2n6gI8vN1aesBFgo9w==
  dependencies:
    yallist "^3.0.2"

make-dir@^2.0.0, make-dir@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/make-dir/-/make-dir-2.1.0.tgz#5f0310e18b8be898cc07009295a30ae41e91e6f5"
  integrity sha512-LS9X+dc8KLxXCb8dni79fLIIUA5VyZoyjSMCwTluaXA0o27cCK0bhXkpgw+sTXVpPy/lSO57ilRixqk0vDmtRA==
  dependencies:
    pify "^4.0.1"
    semver "^5.6.0"

make-dir@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/make-dir/-/make-dir-3.0.2.tgz#04a1acbf22221e1d6ef43559f43e05a90dbb4392"
  integrity sha512-rYKABKutXa6vXTXhoV18cBE7PaewPXHe/Bdq4v+ZLMhxbWApkFFplT0LcbMW+6BbjnQXzZ/sAvSE/JdguApG5w==
  dependencies:
    semver "^6.0.0"

makeerror@1.0.x:
  version "1.0.11"
  resolved "https://registry.yarnpkg.com/makeerror/-/makeerror-1.0.11.tgz#e01a5c9109f2af79660e4e8b9587790184f5a96c"
  integrity sha1-4BpckQnyr3lmDk6LlYd5AYT1qWw=
  dependencies:
    tmpl "1.0.x"

mamacro@^0.0.3:
  version "0.0.3"
  resolved "https://registry.yarnpkg.com/mamacro/-/mamacro-0.0.3.tgz#ad2c9576197c9f1abf308d0787865bd975a3f3e4"
  integrity sha512-qMEwh+UujcQ+kbz3T6V+wAmO2U8veoq2w+3wY8MquqwVA3jChfwY+Tk52GZKDfACEPjuZ7r2oJLejwpt8jtwTA==

map-age-cleaner@^0.1.1:
  version "0.1.3"
  resolved "https://registry.yarnpkg.com/map-age-cleaner/-/map-age-cleaner-0.1.3.tgz#7d583a7306434c055fe474b0f45078e6e1b4b92a"
  integrity sha512-bJzx6nMoP6PDLPBFmg7+xRKeFZvFboMrGlxmNj9ClvX53KrmvM5bXFXEWjbz4cz1AFn+jWJ9z/DJSz7hrs0w3w==
  dependencies:
    p-defer "^1.0.0"

map-cache@^0.2.2:
  version "0.2.2"
  resolved "https://registry.yarnpkg.com/map-cache/-/map-cache-0.2.2.tgz#c32abd0bd6525d9b051645bb4f26ac5dc98a0dbf"
  integrity sha1-wyq9C9ZSXZsFFkW7TyasXcmKDb8=

map-visit@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/map-visit/-/map-visit-1.0.0.tgz#ecdca8f13144e660f1b5bd41f12f3479d98dfb8f"
  integrity sha1-7Nyo8TFE5mDxtb1B8S80edmN+48=
  dependencies:
    object-visit "^1.0.0"

md5.js@^1.3.4:
  version "1.3.5"
  resolved "https://registry.yarnpkg.com/md5.js/-/md5.js-1.3.5.tgz#b5d07b8e3216e3e27cd728d72f70d1e6a342005f"
  integrity sha512-xitP+WxNPcTTOgnTJcrhM0xvdPepipPSf3I8EIpGKeFLjt3PlJLIDG3u8EX53ZIubkb+5U2+3rELYpEhHhzdkg==
  dependencies:
    hash-base "^3.0.0"
    inherits "^2.0.1"
    safe-buffer "^5.1.2"

mdn-data@2.0.4:
  version "2.0.4"
  resolved "https://registry.yarnpkg.com/mdn-data/-/mdn-data-2.0.4.tgz#699b3c38ac6f1d728091a64650b65d388502fd5b"
  integrity sha512-iV3XNKw06j5Q7mi6h+9vbx23Tv7JkjEVgKHW4pimwyDGWm0OIQntJJ+u1C6mg6mK1EaTv42XQ7w76yuzH7M2cA==

media-typer@0.3.0:
  version "0.3.0"
  resolved "https://registry.yarnpkg.com/media-typer/-/media-typer-0.3.0.tgz#8710d7af0aa626f8fffa1ce00168545263255748"
  integrity sha1-hxDXrwqmJvj/+hzgAWhUUmMlV0g=

mem@^4.0.0:
  version "4.3.0"
  resolved "https://registry.yarnpkg.com/mem/-/mem-4.3.0.tgz#461af497bc4ae09608cdb2e60eefb69bff744178"
  integrity sha512-qX2bG48pTqYRVmDB37rn/6PT7LcR8T7oAX3bf99u1Tt1nzxYfxkgqDwUwolPlXweM0XzBOBFzSx4kfp7KP1s/w==
  dependencies:
    map-age-cleaner "^0.1.1"
    mimic-fn "^2.0.0"
    p-is-promise "^2.0.0"

memory-fs@^0.4.1:
  version "0.4.1"
  resolved "https://registry.yarnpkg.com/memory-fs/-/memory-fs-0.4.1.tgz#3a9a20b8462523e447cfbc7e8bb80ed667bfc552"
  integrity sha1-OpoguEYlI+RHz7x+i7gO1me/xVI=
  dependencies:
    errno "^0.1.3"
    readable-stream "^2.0.1"

memory-fs@^0.5.0:
  version "0.5.0"
  resolved "https://registry.yarnpkg.com/memory-fs/-/memory-fs-0.5.0.tgz#324c01288b88652966d161db77838720845a8e3c"
  integrity sha512-jA0rdU5KoQMC0e6ppoNRtpp6vjFq6+NY7r8hywnC7V+1Xj/MtHwGIbB1QaK/dunyjWteJzmkpd7ooeWg10T7GA==
  dependencies:
    errno "^0.1.3"
    readable-stream "^2.0.1"

merge-deep@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/merge-deep/-/merge-deep-3.0.2.tgz#f39fa100a4f1bd34ff29f7d2bf4508fbb8d83ad2"
  integrity sha512-T7qC8kg4Zoti1cFd8Cr0M+qaZfOwjlPDEdZIIPPB2JZctjaPM4fX+i7HOId69tAti2fvO6X5ldfYUONDODsrkA==
  dependencies:
    arr-union "^3.1.0"
    clone-deep "^0.2.4"
    kind-of "^3.0.2"

merge-descriptors@1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/merge-descriptors/-/merge-descriptors-1.0.1.tgz#b00aaa556dd8b44568150ec9d1b953f3f90cbb61"
  integrity sha1-sAqqVW3YtEVoFQ7J0blT8/kMu2E=

merge-stream@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/merge-stream/-/merge-stream-2.0.0.tgz#52823629a14dd00c9770fb6ad47dc6310f2c1f60"
  integrity sha512-abv/qOcuPfk3URPfDzmZU1LKmuw8kT+0nIHvKrKgFrwifol/doWcdA4ZqsWQ8ENrFKkd67Mfpo/LovbIUsbt3w==

merge2@^1.2.3:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/merge2/-/merge2-1.3.0.tgz#5b366ee83b2f1582c48f87e47cf1a9352103ca81"
  integrity sha512-2j4DAdlBOkiSZIsaXk4mTE3sRS02yBHAtfy127xRV3bQUFqXkjHCHLW6Scv7DwNRbIWNHH8zpnz9zMaKXIdvYw==

methods@~1.1.2:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/methods/-/methods-1.1.2.tgz#5529a4d67654134edcc5266656835b0f851afcee"
  integrity sha1-VSmk1nZUE07cxSZmVoNbD4Ua/O4=

microevent.ts@~0.1.1:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/microevent.ts/-/microevent.ts-0.1.1.tgz#70b09b83f43df5172d0205a63025bce0f7357fa0"
  integrity sha512-jo1OfR4TaEwd5HOrt5+tAZ9mqT4jmpNAusXtyfNzqVm9uiSYFZlKM1wYL4oU7azZW/PxQW53wM0S6OR1JHNa2g==

micromatch@^3.1.10, micromatch@^3.1.4:
  version "3.1.10"
  resolved "https://registry.yarnpkg.com/micromatch/-/micromatch-3.1.10.tgz#70859bc95c9840952f359a068a3fc49f9ecfac23"
  integrity sha512-MWikgl9n9M3w+bpsY3He8L+w9eF9338xRl8IAO5viDizwSzziFEyUzo2xrrloB64ADbTf8uA8vRqqttDTOmccg==
  dependencies:
    arr-diff "^4.0.0"
    array-unique "^0.3.2"
    braces "^2.3.1"
    define-property "^2.0.2"
    extend-shallow "^3.0.2"
    extglob "^2.0.4"
    fragment-cache "^0.2.1"
    kind-of "^6.0.2"
    nanomatch "^1.2.9"
    object.pick "^1.3.0"
    regex-not "^1.0.0"
    snapdragon "^0.8.1"
    to-regex "^3.0.2"

miller-rabin@^4.0.0:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/miller-rabin/-/miller-rabin-4.0.1.tgz#f080351c865b0dc562a8462966daa53543c78a4d"
  integrity sha512-115fLhvZVqWwHPbClyntxEVfVDfl9DLLTuJvq3g2O/Oxi8AiNouAHvDSzHS0viUJc+V5vm3eq91Xwqn9dp4jRA==
  dependencies:
    bn.js "^4.0.0"
    brorand "^1.0.1"

mime-db@1.43.0, "mime-db@>= 1.43.0 < 2":
  version "1.43.0"
  resolved "https://registry.yarnpkg.com/mime-db/-/mime-db-1.43.0.tgz#0a12e0502650e473d735535050e7c8f4eb4fae58"
  integrity sha512-+5dsGEEovYbT8UY9yD7eE4XTc4UwJ1jBYlgaQQF38ENsKR3wj/8q8RFZrF9WIZpB2V1ArTVFUva8sAul1NzRzQ==

mime-types@^2.1.12, mime-types@~2.1.17, mime-types@~2.1.19, mime-types@~2.1.24:
  version "2.1.26"
  resolved "https://registry.yarnpkg.com/mime-types/-/mime-types-2.1.26.tgz#9c921fc09b7e149a65dfdc0da4d20997200b0a06"
  integrity sha512-01paPWYgLrkqAyrlDorC1uDwl2p3qZT7yl806vW7DvDoxwXi46jsjFbg+WdwotBIk6/MbEhO/dh5aZ5sNj/dWQ==
  dependencies:
    mime-db "1.43.0"

mime@1.6.0:
  version "1.6.0"
  resolved "https://registry.yarnpkg.com/mime/-/mime-1.6.0.tgz#32cd9e5c64553bd58d19a568af452acff04981b1"
  integrity sha512-x0Vn8spI+wuJ1O6S7gnbaQg8Pxh4NNHb7KSINmEWKiPE4RKOplvijn+NkmYmmRgP68mc70j2EbeTFRsrswaQeg==

mime@^2.4.4:
  version "2.4.4"
  resolved "https://registry.yarnpkg.com/mime/-/mime-2.4.4.tgz#bd7b91135fc6b01cde3e9bae33d659b63d8857e5"
  integrity sha512-LRxmNwziLPT828z+4YkNzloCFC2YM4wrB99k+AV5ZbEyfGNWfG8SO1FUXLmLDBSo89NrJZ4DIWeLjy1CHGhMGA==

mimic-fn@^2.0.0, mimic-fn@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/mimic-fn/-/mimic-fn-2.1.0.tgz#7ed2c2ccccaf84d3ffcb7a69b57711fc2083401b"
  integrity sha512-OqbOk5oEQeAZ8WXWydlu9HJjz9WVdEIvamMCcXmuqUYjTknH/sqsWvhQ3vgwKFRR1HpjvNBKQ37nbJgYzGqGcg==

min-indent@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/min-indent/-/min-indent-1.0.0.tgz#cfc45c37e9ec0d8f0a0ec3dd4ef7f7c3abe39256"
  integrity sha1-z8RcN+nsDY8KDsPdTvf3w6vjklY=

mini-css-extract-plugin@0.9.0:
  version "0.9.0"
  resolved "https://registry.yarnpkg.com/mini-css-extract-plugin/-/mini-css-extract-plugin-0.9.0.tgz#47f2cf07aa165ab35733b1fc97d4c46c0564339e"
  integrity sha512-lp3GeY7ygcgAmVIcRPBVhIkf8Us7FZjA+ILpal44qLdSu11wmjKQ3d9k15lfD7pO4esu9eUIAW7qiYIBppv40A==
  dependencies:
    loader-utils "^1.1.0"
    normalize-url "1.9.1"
    schema-utils "^1.0.0"
    webpack-sources "^1.1.0"

minimalistic-assert@^1.0.0, minimalistic-assert@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/minimalistic-assert/-/minimalistic-assert-1.0.1.tgz#2e194de044626d4a10e7f7fbc00ce73e83e4d5c7"
  integrity sha512-UtJcAD4yEaGtjPezWuO9wC4nwUnVH/8/Im3yEHQP4b67cXlD/Qr9hdITCU1xDbSEXg2XKNaP8jsReV7vQd00/A==

minimalistic-crypto-utils@^1.0.0, minimalistic-crypto-utils@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/minimalistic-crypto-utils/-/minimalistic-crypto-utils-1.0.1.tgz#f6c00c1c0b082246e5c4d99dfb8c7c083b2b582a"
  integrity sha1-9sAMHAsIIkblxNmd+4x8CDsrWCo=

minimatch@3.0.4, minimatch@^3.0.4:
  version "3.0.4"
  resolved "https://registry.yarnpkg.com/minimatch/-/minimatch-3.0.4.tgz#5166e286457f03306064be5497e8dbb0c3d32083"
  integrity sha512-yJHVQEhyqPLUTgt9B83PXu6W3rx4MvvHvSUvToogpwoGDOUQ+yDrR0HRot+yOCdCO7u4hX3pWft6kWBBcqh0UA==
  dependencies:
    brace-expansion "^1.1.7"

minimist@0.0.8:
  version "0.0.8"
  resolved "https://registry.yarnpkg.com/minimist/-/minimist-0.0.8.tgz#857fcabfc3397d2625b8228262e86aa7a011b05d"
  integrity sha1-hX/Kv8M5fSYluCKCYuhqp6ARsF0=

minimist@^1.1.1, minimist@^1.2.0, minimist@^1.2.5:
  version "1.2.5"
  resolved "https://registry.yarnpkg.com/minimist/-/minimist-1.2.5.tgz#67d66014b66a6a8aaa0c083c5fd58df4e4e97602"
  integrity sha512-FM9nNUYrRBAELZQT3xeZQ7fmMOBg6nWNmJKTcgsJeaLstP/UODVpGsr5OhXhhXg6f+qtJ8uiZ+PUxkDWcgIXLw==

minipass-collect@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/minipass-collect/-/minipass-collect-1.0.2.tgz#22b813bf745dc6edba2576b940022ad6edc8c617"
  integrity sha512-6T6lH0H8OG9kITm/Jm6tdooIbogG9e0tLgpY6mphXSm/A9u8Nq1ryBG+Qspiub9LjWlBPsPS3tWQ/Botq4FdxA==
  dependencies:
    minipass "^3.0.0"

minipass-flush@^1.0.5:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/minipass-flush/-/minipass-flush-1.0.5.tgz#82e7135d7e89a50ffe64610a787953c4c4cbb373"
  integrity sha512-JmQSYYpPUqX5Jyn1mXaRwOda1uQ8HP5KAT/oDSLCzt1BYRhQU0/hDtsB1ufZfEEzMZ9aAVmsBw8+FWsIXlClWw==
  dependencies:
    minipass "^3.0.0"

minipass-pipeline@^1.2.2:
  version "1.2.2"
  resolved "https://registry.yarnpkg.com/minipass-pipeline/-/minipass-pipeline-1.2.2.tgz#3dcb6bb4a546e32969c7ad710f2c79a86abba93a"
  integrity sha512-3JS5A2DKhD2g0Gg8x3yamO0pj7YeKGwVlDS90pF++kxptwx/F+B//roxf9SqYil5tQo65bijy+dAuAFZmYOouA==
  dependencies:
    minipass "^3.0.0"

minipass@^3.0.0, minipass@^3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/minipass/-/minipass-3.1.1.tgz#7607ce778472a185ad6d89082aa2070f79cedcd5"
  integrity sha512-UFqVihv6PQgwj8/yTGvl9kPz7xIAY+R5z6XYjRInD3Gk3qx6QGSD6zEcpeG4Dy/lQnv1J6zv8ejV90hyYIKf3w==
  dependencies:
    yallist "^4.0.0"

mississippi@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/mississippi/-/mississippi-3.0.0.tgz#ea0a3291f97e0b5e8776b363d5f0a12d94c67022"
  integrity sha512-x471SsVjUtBRtcvd4BzKE9kFC+/2TeWgKCgw0bZcw1b9l2X3QX5vCWgF+KaZaYm87Ss//rHnWryupDrgLvmSkA==
  dependencies:
    concat-stream "^1.5.0"
    duplexify "^3.4.2"
    end-of-stream "^1.1.0"
    flush-write-stream "^1.0.0"
    from2 "^2.1.0"
    parallel-transform "^1.1.0"
    pump "^3.0.0"
    pumpify "^1.3.3"
    stream-each "^1.1.0"
    through2 "^2.0.0"

mixin-deep@^1.2.0:
  version "1.3.2"
  resolved "https://registry.yarnpkg.com/mixin-deep/-/mixin-deep-1.3.2.tgz#1120b43dc359a785dce65b55b82e257ccf479566"
  integrity sha512-WRoDn//mXBiJ1H40rqa3vH0toePwSsGb45iInWlTySa+Uu4k3tYUSxa2v1KqAiLtvlrSzaExqS1gtk96A9zvEA==
  dependencies:
    for-in "^1.0.2"
    is-extendable "^1.0.1"

mixin-object@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/mixin-object/-/mixin-object-2.0.1.tgz#4fb949441dab182540f1fe035ba60e1947a5e57e"
  integrity sha1-T7lJRB2rGCVA8f4DW6YOGUel5X4=
  dependencies:
    for-in "^0.1.3"
    is-extendable "^0.1.1"

mkdirp@0.5.1:
  version "0.5.1"
  resolved "https://registry.yarnpkg.com/mkdirp/-/mkdirp-0.5.1.tgz#30057438eac6cf7f8c4767f38648d6697d75c903"
  integrity sha1-MAV0OOrGz3+MR2fzhkjWaX11yQM=
  dependencies:
    minimist "0.0.8"

mkdirp@^0.5.1, mkdirp@^0.5.3, mkdirp@~0.5.1:
  version "0.5.3"
  resolved "https://registry.yarnpkg.com/mkdirp/-/mkdirp-0.5.3.tgz#5a514b7179259287952881e94410ec5465659f8c"
  integrity sha512-P+2gwrFqx8lhew375MQHHeTlY8AuOJSrGf0R5ddkEndUkmwpgUob/vQuBD1V22/Cw1/lJr4x+EjllSezBThzBg==
  dependencies:
    minimist "^1.2.5"

move-concurrently@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/move-concurrently/-/move-concurrently-1.0.1.tgz#be2c005fda32e0b29af1f05d7c4b33214c701f92"
  integrity sha1-viwAX9oy4LKa8fBdfEszIUxwH5I=
  dependencies:
    aproba "^1.1.1"
    copy-concurrently "^1.0.0"
    fs-write-stream-atomic "^1.0.8"
    mkdirp "^0.5.1"
    rimraf "^2.5.4"
    run-queue "^1.0.3"

ms@2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/ms/-/ms-2.0.0.tgz#5608aeadfc00be6c2901df5f9861788de0d597c8"
  integrity sha1-VgiurfwAvmwpAd9fmGF4jeDVl8g=

ms@2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/ms/-/ms-2.1.1.tgz#30a5864eb3ebb0a66f2ebe6d727af06a09d86e0a"
  integrity sha512-tgp+dl5cGk28utYktBsrFqA7HKgrhgPsg6Z/EfhWI4gl1Hwq8B/GmY/0oXZ6nF8hDVesS/FpnYaD/kOWhYQvyg==

ms@^2.1.1:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/ms/-/ms-2.1.2.tgz#d09d1f357b443f493382a8eb3ccd183872ae6009"
  integrity sha512-sGkPx+VjMtmA6MX27oA4FBFELFCZZ4S4XqeGOXCv68tT+jb3vk/RyaKWP0PTKyWtmLSM0b+adUTEvbs1PEaH2w==

multicast-dns-service-types@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/multicast-dns-service-types/-/multicast-dns-service-types-1.1.0.tgz#899f11d9686e5e05cb91b35d5f0e63b773cfc901"
  integrity sha1-iZ8R2WhuXgXLkbNdXw5jt3PPyQE=

multicast-dns@^6.0.1:
  version "6.2.3"
  resolved "https://registry.yarnpkg.com/multicast-dns/-/multicast-dns-6.2.3.tgz#a0ec7bd9055c4282f790c3c82f4e28db3b31b229"
  integrity sha512-ji6J5enbMyGRHIAkAOu3WdV8nggqviKCEKtXcOqfphZZtQrmHKycfynJ2V7eVPUA4NhJ6V7Wf4TmGbTwKE9B6g==
  dependencies:
    dns-packet "^1.3.1"
    thunky "^1.0.2"

mute-stream@0.0.8:
  version "0.0.8"
  resolved "https://registry.yarnpkg.com/mute-stream/-/mute-stream-0.0.8.tgz#1630c42b2251ff81e2a283de96a5497ea92e5e0d"
  integrity sha512-nnbWWOkoWyUsTjKrhgD0dcz22mdkSnpYqbEjIm2nhwhuxlSkpywJmBo8h0ZqJdkp73mb90SssHkN4rsRaBAfAA==

nan@^2.12.1:
  version "2.14.0"
  resolved "https://registry.yarnpkg.com/nan/-/nan-2.14.0.tgz#7818f722027b2459a86f0295d434d1fc2336c52c"
  integrity sha512-INOFj37C7k3AfaNTtX8RhsTw7qRy7eLET14cROi9+5HAVbbHuIWUHEauBv5qT4Av2tWasiTY1Jw6puUNqRJXQg==

nanomatch@^1.2.9:
  version "1.2.13"
  resolved "https://registry.yarnpkg.com/nanomatch/-/nanomatch-1.2.13.tgz#b87a8aa4fc0de8fe6be88895b38983ff265bd119"
  integrity sha512-fpoe2T0RbHwBTBUOftAfBPaDEi06ufaUai0mE6Yn1kacc3SnTErfb/h+X94VXzI64rKFHYImXSvdwGGCmwOqCA==
  dependencies:
    arr-diff "^4.0.0"
    array-unique "^0.3.2"
    define-property "^2.0.2"
    extend-shallow "^3.0.2"
    fragment-cache "^0.2.1"
    is-windows "^1.0.2"
    kind-of "^6.0.2"
    object.pick "^1.3.0"
    regex-not "^1.0.0"
    snapdragon "^0.8.1"
    to-regex "^3.0.1"

natural-compare@^1.4.0:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/natural-compare/-/natural-compare-1.4.0.tgz#4abebfeed7541f2c27acfb29bdbbd15c8d5ba4f7"
  integrity sha1-Sr6/7tdUHywnrPspvbvRXI1bpPc=

negotiator@0.6.2:
  version "0.6.2"
  resolved "https://registry.yarnpkg.com/negotiator/-/negotiator-0.6.2.tgz#feacf7ccf525a77ae9634436a64883ffeca346fb"
  integrity sha512-hZXc7K2e+PgeI1eDBe/10Ard4ekbfrrqG8Ep+8Jmf4JID2bNg7NvCPOZN+kfF574pFQI7mum2AUqDidoKqcTOw==

neo-async@^2.5.0, neo-async@^2.6.1:
  version "2.6.1"
  resolved "https://registry.yarnpkg.com/neo-async/-/neo-async-2.6.1.tgz#ac27ada66167fa8849a6addd837f6b189ad2081c"
  integrity sha512-iyam8fBuCUpWeKPGpaNMetEocMt364qkCsfL9JuhjXX6dRnguRVOfk2GZaDpPjcOKiiXCPINZC1GczQ7iTq3Zw==

next-tick@~1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/next-tick/-/next-tick-1.0.0.tgz#ca86d1fe8828169b0120208e3dc8424b9db8342c"
  integrity sha1-yobR/ogoFpsBICCOPchCS524NCw=

nice-try@^1.0.4:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/nice-try/-/nice-try-1.0.5.tgz#a3378a7696ce7d223e88fc9b764bd7ef1089e366"
  integrity sha512-1nh45deeb5olNY7eX82BkPO7SSxR5SSYJiPTrTdFUVYwAl8CKMA5N9PjTYkHiRjisVcxcQ1HXdLhx2qxxJzLNQ==

no-case@^3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/no-case/-/no-case-3.0.3.tgz#c21b434c1ffe48b39087e86cfb4d2582e9df18f8"
  integrity sha512-ehY/mVQCf9BL0gKfsJBvFJen+1V//U+0HQMPrWct40ixE4jnv0bfvxDbWtAHL9EcaPEOJHVVYKoQn1TlZUB8Tw==
  dependencies:
    lower-case "^2.0.1"
    tslib "^1.10.0"

node-forge@0.9.0:
  version "0.9.0"
  resolved "https://registry.yarnpkg.com/node-forge/-/node-forge-0.9.0.tgz#d624050edbb44874adca12bb9a52ec63cb782579"
  integrity sha512-7ASaDa3pD+lJ3WvXFsxekJQelBKRpne+GOVbLbtHYdd7pFspyeuJHnWfLplGf3SwKGbfs/aYl5V/JCIaHVUKKQ==

node-int64@^0.4.0:
  version "0.4.0"
  resolved "https://registry.yarnpkg.com/node-int64/-/node-int64-0.4.0.tgz#87a9065cdb355d3182d8f94ce11188b825c68a3b"
  integrity sha1-h6kGXNs1XTGC2PlM4RGIuCXGijs=

node-libs-browser@^2.2.1:
  version "2.2.1"
  resolved "https://registry.yarnpkg.com/node-libs-browser/-/node-libs-browser-2.2.1.tgz#b64f513d18338625f90346d27b0d235e631f6425"
  integrity sha512-h/zcD8H9kaDZ9ALUWwlBUDo6TKF8a7qBSCSEGfjTVIYeqsioSKaAX+BN7NgiMGp6iSIXZ3PxgCu8KS3b71YK5Q==
  dependencies:
    assert "^1.1.1"
    browserify-zlib "^0.2.0"
    buffer "^4.3.0"
    console-browserify "^1.1.0"
    constants-browserify "^1.0.0"
    crypto-browserify "^3.11.0"
    domain-browser "^1.1.1"
    events "^3.0.0"
    https-browserify "^1.0.0"
    os-browserify "^0.3.0"
    path-browserify "0.0.1"
    process "^0.11.10"
    punycode "^1.2.4"
    querystring-es3 "^0.2.0"
    readable-stream "^2.3.3"
    stream-browserify "^2.0.1"
    stream-http "^2.7.2"
    string_decoder "^1.0.0"
    timers-browserify "^2.0.4"
    tty-browserify "0.0.0"
    url "^0.11.0"
    util "^0.11.0"
    vm-browserify "^1.0.1"

node-modules-regexp@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/node-modules-regexp/-/node-modules-regexp-1.0.0.tgz#8d9dbe28964a4ac5712e9131642107c71e90ec40"
  integrity sha1-jZ2+KJZKSsVxLpExZCEHxx6Q7EA=

node-notifier@^5.4.2:
  version "5.4.3"
  resolved "https://registry.yarnpkg.com/node-notifier/-/node-notifier-5.4.3.tgz#cb72daf94c93904098e28b9c590fd866e464bd50"
  integrity sha512-M4UBGcs4jeOK9CjTsYwkvH6/MzuUmGCyTW+kCY7uO+1ZVr0+FHGdPdIf5CCLqAaxnRrWidyoQlNkMIIVwbKB8Q==
  dependencies:
    growly "^1.3.0"
    is-wsl "^1.1.0"
    semver "^5.5.0"
    shellwords "^0.1.1"
    which "^1.3.0"

node-releases@^1.1.52:
  version "1.1.52"
  resolved "https://registry.yarnpkg.com/node-releases/-/node-releases-1.1.52.tgz#bcffee3e0a758e92e44ecfaecd0a47554b0bcba9"
  integrity sha512-snSiT1UypkgGt2wxPqS6ImEUICbNCMb31yaxWrOLXjhlt2z2/IBpaOxzONExqSm4y5oLnAqjjRWu+wsDzK5yNQ==
  dependencies:
    semver "^6.3.0"

normalize-package-data@^2.3.2:
  version "2.5.0"
  resolved "https://registry.yarnpkg.com/normalize-package-data/-/normalize-package-data-2.5.0.tgz#e66db1838b200c1dfc233225d12cb36520e234a8"
  integrity sha512-/5CMN3T0R4XTj4DcGaexo+roZSdSFW/0AOOTROrjxzCG1wrWXEsGbRKevjlIL+ZDE4sZlJr5ED4YW0yqmkK+eA==
  dependencies:
    hosted-git-info "^2.1.4"
    resolve "^1.10.0"
    semver "2 || 3 || 4 || 5"
    validate-npm-package-license "^3.0.1"

normalize-path@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/normalize-path/-/normalize-path-2.1.1.tgz#1ab28b556e198363a8c1a6f7e6fa20137fe6aed9"
  integrity sha1-GrKLVW4Zg2Oowab35vogE3/mrtk=
  dependencies:
    remove-trailing-separator "^1.0.1"

normalize-path@^3.0.0, normalize-path@~3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/normalize-path/-/normalize-path-3.0.0.tgz#0dcd69ff23a1c9b11fd0978316644a0388216a65"
  integrity sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==

normalize-range@^0.1.2:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/normalize-range/-/normalize-range-0.1.2.tgz#2d10c06bdfd312ea9777695a4d28439456b75942"
  integrity sha1-LRDAa9/TEuqXd2laTShDlFa3WUI=

normalize-url@1.9.1:
  version "1.9.1"
  resolved "https://registry.yarnpkg.com/normalize-url/-/normalize-url-1.9.1.tgz#2cc0d66b31ea23036458436e3620d85954c66c3c"
  integrity sha1-LMDWazHqIwNkWENuNiDYWVTGbDw=
  dependencies:
    object-assign "^4.0.1"
    prepend-http "^1.0.0"
    query-string "^4.1.0"
    sort-keys "^1.0.0"

normalize-url@^3.0.0:
  version "3.3.0"
  resolved "https://registry.yarnpkg.com/normalize-url/-/normalize-url-3.3.0.tgz#b2e1c4dc4f7c6d57743df733a4f5978d18650559"
  integrity sha512-U+JJi7duF1o+u2pynbp2zXDW2/PADgC30f0GsHZtRh+HOcXHnw137TrNlyxxRvWW5fjKd3bcLHPxofWuCjaeZg==

npm-run-path@^2.0.0:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/npm-run-path/-/npm-run-path-2.0.2.tgz#35a9232dfa35d7067b4cb2ddf2357b1871536c5f"
  integrity sha1-NakjLfo11wZ7TLLd8jV7GHFTbF8=
  dependencies:
    path-key "^2.0.0"

nth-check@^1.0.2, nth-check@~1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/nth-check/-/nth-check-1.0.2.tgz#b2bd295c37e3dd58a3bf0700376663ba4d9cf05c"
  integrity sha512-WeBOdju8SnzPN5vTUJYxYUxLeXpCaVP5i5e0LF8fg7WORF2Wd7wFX/pk0tYZk7s8T+J7VLy0Da6J1+wCT0AtHg==
  dependencies:
    boolbase "~1.0.0"

num2fraction@^1.2.2:
  version "1.2.2"
  resolved "https://registry.yarnpkg.com/num2fraction/-/num2fraction-1.2.2.tgz#6f682b6a027a4e9ddfa4564cd2589d1d4e669ede"
  integrity sha1-b2gragJ6Tp3fpFZM0lidHU5mnt4=

number-is-nan@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/number-is-nan/-/number-is-nan-1.0.1.tgz#097b602b53422a522c1afb8790318336941a011d"
  integrity sha1-CXtgK1NCKlIsGvuHkDGDNpQaAR0=

nwsapi@^2.0.7, nwsapi@^2.1.3:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/nwsapi/-/nwsapi-2.2.0.tgz#204879a9e3d068ff2a55139c2c772780681a38b7"
  integrity sha512-h2AatdwYH+JHiZpv7pt/gSX1XoRGb7L/qSIeuqA6GwYoF9w1vP1cw42TO0aI2pNyshRK5893hNSl+1//vHK7hQ==

oauth-sign@~0.9.0:
  version "0.9.0"
  resolved "https://registry.yarnpkg.com/oauth-sign/-/oauth-sign-0.9.0.tgz#47a7b016baa68b5fa0ecf3dee08a85c679ac6455"
  integrity sha512-fexhUFFPTGV8ybAtSIGbV6gOkSv8UtRbDBnAyLQw4QPKkgNlsH2ByPGtMUqdWkos6YCRmAqViwgZrJc/mRDzZQ==

object-assign@^4.0.1, object-assign@^4.1.0, object-assign@^4.1.1:
  version "4.1.1"
  resolved "https://registry.yarnpkg.com/object-assign/-/object-assign-4.1.1.tgz#2109adc7965887cfc05cbbd442cac8bfbb360863"
  integrity sha1-IQmtx5ZYh8/AXLvUQsrIv7s2CGM=

object-copy@^0.1.0:
  version "0.1.0"
  resolved "https://registry.yarnpkg.com/object-copy/-/object-copy-0.1.0.tgz#7e7d858b781bd7c991a41ba975ed3812754e998c"
  integrity sha1-fn2Fi3gb18mRpBupde04EnVOmYw=
  dependencies:
    copy-descriptor "^0.1.0"
    define-property "^0.2.5"
    kind-of "^3.0.3"

object-hash@^2.0.1:
  version "2.0.3"
  resolved "https://registry.yarnpkg.com/object-hash/-/object-hash-2.0.3.tgz#d12db044e03cd2ca3d77c0570d87225b02e1e6ea"
  integrity sha512-JPKn0GMu+Fa3zt3Bmr66JhokJU5BaNBIh4ZeTlaCBzrBsOeXzwcKKAK1tbLiPKgvwmPXsDvvLHoWh5Bm7ofIYg==

object-inspect@^1.7.0:
  version "1.7.0"
  resolved "https://registry.yarnpkg.com/object-inspect/-/object-inspect-1.7.0.tgz#f4f6bd181ad77f006b5ece60bd0b6f398ff74a67"
  integrity sha512-a7pEHdh1xKIAgTySUGgLMx/xwDZskN1Ud6egYYN3EdRW4ZMPNEDUTF+hwy2LUC+Bl+SyLXANnwz/jyh/qutKUw==

object-is@^1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/object-is/-/object-is-1.0.2.tgz#6b80eb84fe451498f65007982f035a5b445edec4"
  integrity sha512-Epah+btZd5wrrfjkJZq1AOB9O6OxUQto45hzFd7lXGrpHPGE0W1k+426yrZV+k6NJOzLNNW/nVsmZdIWsAqoOQ==

object-keys@^1.0.11, object-keys@^1.0.12, object-keys@^1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/object-keys/-/object-keys-1.1.1.tgz#1c47f272df277f3b1daf061677d9c82e2322c60e"
  integrity sha512-NuAESUOUMrlIXOfHKzD6bpPu3tYt3xvjNdRIQ+FeT0lNb4K8WR70CaDxhuNguS2XG+GjkyMwOzsN5ZktImfhLA==

object-path@0.11.4:
  version "0.11.4"
  resolved "https://registry.yarnpkg.com/object-path/-/object-path-0.11.4.tgz#370ae752fbf37de3ea70a861c23bba8915691949"
  integrity sha1-NwrnUvvzfePqcKhhwju6iRVpGUk=

object-visit@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/object-visit/-/object-visit-1.0.1.tgz#f79c4493af0c5377b59fe39d395e41042dd045bb"
  integrity sha1-95xEk68MU3e1n+OdOV5BBC3QRbs=
  dependencies:
    isobject "^3.0.0"

object.assign@^4.1.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/object.assign/-/object.assign-4.1.0.tgz#968bf1100d7956bb3ca086f006f846b3bc4008da"
  integrity sha512-exHJeq6kBKj58mqGyTQ9DFvrZC/eR6OwxzoM9YRoGBqrXYonaFyGiFMuc9VZrXf7DarreEwMpurG3dd+CNyW5w==
  dependencies:
    define-properties "^1.1.2"
    function-bind "^1.1.1"
    has-symbols "^1.0.0"
    object-keys "^1.0.11"

object.entries@^1.1.0, object.entries@^1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/object.entries/-/object.entries-1.1.1.tgz#ee1cf04153de02bb093fec33683900f57ce5399b"
  integrity sha512-ilqR7BgdyZetJutmDPfXCDffGa0/Yzl2ivVNpbx/g4UeWrCdRnFDUBrKJGLhGieRHDATnyZXWBeCb29k9CJysQ==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0-next.1"
    function-bind "^1.1.1"
    has "^1.0.3"

object.fromentries@^2.0.2:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/object.fromentries/-/object.fromentries-2.0.2.tgz#4a09c9b9bb3843dd0f89acdb517a794d4f355ac9"
  integrity sha512-r3ZiBH7MQppDJVLx6fhD618GKNG40CZYH9wgwdhKxBDDbQgjeWGGd4AtkZad84d291YxvWe7bJGuE65Anh0dxQ==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0-next.1"
    function-bind "^1.1.1"
    has "^1.0.3"

object.getownpropertydescriptors@^2.0.3, object.getownpropertydescriptors@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/object.getownpropertydescriptors/-/object.getownpropertydescriptors-2.1.0.tgz#369bf1f9592d8ab89d712dced5cb81c7c5352649"
  integrity sha512-Z53Oah9A3TdLoblT7VKJaTDdXdT+lQO+cNpKVnya5JDe9uLvzu1YyY1yFDFrcxrlRgWrEFH0jJtD/IbuwjcEVg==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0-next.1"

object.pick@^1.3.0:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/object.pick/-/object.pick-1.3.0.tgz#87a10ac4c1694bd2e1cbf53591a66141fb5dd747"
  integrity sha1-h6EKxMFpS9Lhy/U1kaZhQftd10c=
  dependencies:
    isobject "^3.0.1"

object.values@^1.1.0, object.values@^1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/object.values/-/object.values-1.1.1.tgz#68a99ecde356b7e9295a3c5e0ce31dc8c953de5e"
  integrity sha512-WTa54g2K8iu0kmS/us18jEmdv1a4Wi//BZ/DTVYEcH0XhLM5NYdpDHja3gt57VrZLcNAO2WGA+KpWsDBaHt6eA==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0-next.1"
    function-bind "^1.1.1"
    has "^1.0.3"

obuf@^1.0.0, obuf@^1.1.2:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/obuf/-/obuf-1.1.2.tgz#09bea3343d41859ebd446292d11c9d4db619084e"
  integrity sha512-PX1wu0AmAdPqOL1mWhqmlOd8kOIZQwGZw6rh7uby9fTc5lhaOWFLX3I6R1hrF9k3zUY40e6igsLGkDXK92LJNg==

on-finished@~2.3.0:
  version "2.3.0"
  resolved "https://registry.yarnpkg.com/on-finished/-/on-finished-2.3.0.tgz#20f1336481b083cd75337992a16971aa2d906947"
  integrity sha1-IPEzZIGwg811M3mSoWlxqi2QaUc=
  dependencies:
    ee-first "1.1.1"

on-headers@~1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/on-headers/-/on-headers-1.0.2.tgz#772b0ae6aaa525c399e489adfad90c403eb3c28f"
  integrity sha512-pZAE+FJLoyITytdqK0U5s+FIpjN0JP3OzFi/u8Rx+EV5/W+JTWGXG8xFzevE7AjBfDqHv/8vL8qQsIhHnqRkrA==

once@^1.3.0, once@^1.3.1, once@^1.4.0:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/once/-/once-1.4.0.tgz#583b1aa775961d4b113ac17d9c50baef9dd76bd1"
  integrity sha1-WDsap3WWHUsROsF9nFC6753Xa9E=
  dependencies:
    wrappy "1"

onetime@^5.1.0:
  version "5.1.0"
  resolved "https://registry.yarnpkg.com/onetime/-/onetime-5.1.0.tgz#fff0f3c91617fe62bb50189636e99ac8a6df7be5"
  integrity sha512-5NcSkPHhwTVFIQN+TUqXoS5+dlElHXdpAWu9I0HP20YOtIi+aZ0Ct82jdlILDxjLEAWwvm+qj1m6aEtsDVmm6Q==
  dependencies:
    mimic-fn "^2.1.0"

open@^7.0.2:
  version "7.0.3"
  resolved "https://registry.yarnpkg.com/open/-/open-7.0.3.tgz#db551a1af9c7ab4c7af664139930826138531c48"
  integrity sha512-sP2ru2v0P290WFfv49Ap8MF6PkzGNnGlAwHweB4WR4mr5d2d0woiCluUeJ218w7/+PmoBy9JmYgD5A4mLcWOFA==
  dependencies:
    is-docker "^2.0.0"
    is-wsl "^2.1.1"

opn@^5.5.0:
  version "5.5.0"
  resolved "https://registry.yarnpkg.com/opn/-/opn-5.5.0.tgz#fc7164fab56d235904c51c3b27da6758ca3b9bfc"
  integrity sha512-PqHpggC9bLV0VeWcdKhkpxY+3JTzetLSqTCWL/z/tFIbI6G8JCjondXklT1JinczLz2Xib62sSp0T/gKT4KksA==
  dependencies:
    is-wsl "^1.1.0"

optimize-css-assets-webpack-plugin@5.0.3:
  version "5.0.3"
  resolved "https://registry.yarnpkg.com/optimize-css-assets-webpack-plugin/-/optimize-css-assets-webpack-plugin-5.0.3.tgz#e2f1d4d94ad8c0af8967ebd7cf138dcb1ef14572"
  integrity sha512-q9fbvCRS6EYtUKKSwI87qm2IxlyJK5b4dygW1rKUBT6mMDhdG5e5bZT63v6tnJR9F9FB/H5a0HTmtw+laUBxKA==
  dependencies:
    cssnano "^4.1.10"
    last-call-webpack-plugin "^3.0.0"

optionator@^0.8.1, optionator@^0.8.3:
  version "0.8.3"
  resolved "https://registry.yarnpkg.com/optionator/-/optionator-0.8.3.tgz#84fa1d036fe9d3c7e21d99884b601167ec8fb495"
  integrity sha512-+IW9pACdk3XWmmTXG8m3upGUJst5XRGzxMRjXzAuJ1XnIFNvfhjjIuYkDvysnPQ7qzqVzLt78BCruntqRhWQbA==
  dependencies:
    deep-is "~0.1.3"
    fast-levenshtein "~2.0.6"
    levn "~0.3.0"
    prelude-ls "~1.1.2"
    type-check "~0.3.2"
    word-wrap "~1.2.3"

original@^1.0.0:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/original/-/original-1.0.2.tgz#e442a61cffe1c5fd20a65f3261c26663b303f25f"
  integrity sha512-hyBVl6iqqUOJ8FqRe+l/gS8H+kKYjrEndd5Pm1MfBtsEKA038HkkdbAl/72EAXGyonD/PFsvmVG+EvcIpliMBg==
  dependencies:
    url-parse "^1.4.3"

os-browserify@^0.3.0:
  version "0.3.0"
  resolved "https://registry.yarnpkg.com/os-browserify/-/os-browserify-0.3.0.tgz#854373c7f5c2315914fc9bfc6bd8238fdda1ec27"
  integrity sha1-hUNzx/XCMVkU/Jv8a9gjj92h7Cc=

os-locale@^3.0.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/os-locale/-/os-locale-3.1.0.tgz#a802a6ee17f24c10483ab9935719cef4ed16bf1a"
  integrity sha512-Z8l3R4wYWM40/52Z+S265okfFj8Kt2cC2MKY+xNi3kFs+XGI7WXu/I309QQQYbRW4ijiZ+yxs9pqEhJh0DqW3Q==
  dependencies:
    execa "^1.0.0"
    lcid "^2.0.0"
    mem "^4.0.0"

os-tmpdir@~1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/os-tmpdir/-/os-tmpdir-1.0.2.tgz#bbe67406c79aa85c5cfec766fe5734555dfa1274"
  integrity sha1-u+Z0BseaqFxc/sdm/lc0VV36EnQ=

p-defer@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/p-defer/-/p-defer-1.0.0.tgz#9f6eb182f6c9aa8cd743004a7d4f96b196b0fb0c"
  integrity sha1-n26xgvbJqozXQwBKfU+WsZaw+ww=

p-each-series@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/p-each-series/-/p-each-series-1.0.0.tgz#930f3d12dd1f50e7434457a22cd6f04ac6ad7f71"
  integrity sha1-kw89Et0fUOdDRFeiLNbwSsatf3E=
  dependencies:
    p-reduce "^1.0.0"

p-finally@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/p-finally/-/p-finally-1.0.0.tgz#3fbcfb15b899a44123b34b6dcc18b724336a2cae"
  integrity sha1-P7z7FbiZpEEjs0ttzBi3JDNqLK4=

p-is-promise@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/p-is-promise/-/p-is-promise-2.1.0.tgz#918cebaea248a62cf7ffab8e3bca8c5f882fc42e"
  integrity sha512-Y3W0wlRPK8ZMRbNq97l4M5otioeA5lm1z7bkNkxCka8HSPjR0xRWmpCmc9utiaLP9Jb1eD8BgeIxTW4AIF45Pg==

p-limit@^1.1.0:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/p-limit/-/p-limit-1.3.0.tgz#b86bd5f0c25690911c7590fcbfc2010d54b3ccb8"
  integrity sha512-vvcXsLAJ9Dr5rQOPk7toZQZJApBl2K4J6dANSsEuh6QI41JYcsS/qhTGa9ErIUUgK3WNQoJYvylxvjqmiqEA9Q==
  dependencies:
    p-try "^1.0.0"

p-limit@^2.0.0, p-limit@^2.2.0, p-limit@^2.2.2:
  version "2.2.2"
  resolved "https://registry.yarnpkg.com/p-limit/-/p-limit-2.2.2.tgz#61279b67721f5287aa1c13a9a7fbbc48c9291b1e"
  integrity sha512-WGR+xHecKTr7EbUEhyLSh5Dube9JtdiG78ufaeLxTgpudf/20KqyMioIUZJAezlTIi6evxuoUs9YXc11cU+yzQ==
  dependencies:
    p-try "^2.0.0"

p-locate@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/p-locate/-/p-locate-2.0.0.tgz#20a0103b222a70c8fd39cc2e580680f3dde5ec43"
  integrity sha1-IKAQOyIqcMj9OcwuWAaA893l7EM=
  dependencies:
    p-limit "^1.1.0"

p-locate@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/p-locate/-/p-locate-3.0.0.tgz#322d69a05c0264b25997d9f40cd8a891ab0064a4"
  integrity sha512-x+12w/To+4GFfgJhBEpiDcLozRJGegY+Ei7/z0tSLkMmxGZNybVMSfWj9aJn8Z5Fc7dBUNJOOVgPv2H7IwulSQ==
  dependencies:
    p-limit "^2.0.0"

p-locate@^4.1.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/p-locate/-/p-locate-4.1.0.tgz#a3428bb7088b3a60292f66919278b7c297ad4f07"
  integrity sha512-R79ZZ/0wAxKGu3oYMlz8jy/kbhsNrS7SKZ7PxEHBgJ5+F2mtFW2fK2cOtBh1cHYkQsbzFV7I+EoRKe6Yt0oK7A==
  dependencies:
    p-limit "^2.2.0"

p-map@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/p-map/-/p-map-2.1.0.tgz#310928feef9c9ecc65b68b17693018a665cea175"
  integrity sha512-y3b8Kpd8OAN444hxfBbFfj1FY/RjtTd8tzYwhUqNYXx0fXx2iX4maP4Qr6qhIKbQXI02wTLAda4fYUbDagTUFw==

p-map@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/p-map/-/p-map-3.0.0.tgz#d704d9af8a2ba684e2600d9a215983d4141a979d"
  integrity sha512-d3qXVTF/s+W+CdJ5A29wywV2n8CQQYahlgz2bFiA+4eVNJbHJodPZ+/gXwPGh0bOqA+j8S+6+ckmvLGPk1QpxQ==
  dependencies:
    aggregate-error "^3.0.0"

p-reduce@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/p-reduce/-/p-reduce-1.0.0.tgz#18c2b0dd936a4690a529f8231f58a0fdb6a47dfa"
  integrity sha1-GMKw3ZNqRpClKfgjH1ig/bakffo=

p-retry@^3.0.1:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/p-retry/-/p-retry-3.0.1.tgz#316b4c8893e2c8dc1cfa891f406c4b422bebf328"
  integrity sha512-XE6G4+YTTkT2a0UWb2kjZe8xNwf8bIbnqpc/IS/idOBVhyves0mK5OJgeocjx7q5pvX/6m23xuzVPYT1uGM73w==
  dependencies:
    retry "^0.12.0"

p-try@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/p-try/-/p-try-1.0.0.tgz#cbc79cdbaf8fd4228e13f621f2b1a237c1b207b3"
  integrity sha1-y8ec26+P1CKOE/Yh8rGiN8GyB7M=

p-try@^2.0.0:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/p-try/-/p-try-2.2.0.tgz#cb2868540e313d61de58fafbe35ce9004d5540e6"
  integrity sha512-R4nPAVTAU0B9D35/Gk3uJf/7XYbQcyohSKdvAxIRSNghFl4e71hVoGnBNQz9cWaXxO2I10KTC+3jMdvvoKw6dQ==

pako@~1.0.5:
  version "1.0.11"
  resolved "https://registry.yarnpkg.com/pako/-/pako-1.0.11.tgz#6c9599d340d54dfd3946380252a35705a6b992bf"
  integrity sha512-4hLB8Py4zZce5s4yd9XzopqwVv/yGNhV1Bl8NTmCq1763HeK2+EwVTv+leGeL13Dnh2wfbqowVPXCIO0z4taYw==

parallel-transform@^1.1.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/parallel-transform/-/parallel-transform-1.2.0.tgz#9049ca37d6cb2182c3b1d2c720be94d14a5814fc"
  integrity sha512-P2vSmIu38uIlvdcU7fDkyrxj33gTUy/ABO5ZUbGowxNCopBq/OoD42bP4UmMrJoPyk4Uqf0mu3mtWBhHCZD8yg==
  dependencies:
    cyclist "^1.0.1"
    inherits "^2.0.3"
    readable-stream "^2.1.5"

param-case@^3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/param-case/-/param-case-3.0.3.tgz#4be41f8399eff621c56eebb829a5e451d9801238"
  integrity sha512-VWBVyimc1+QrzappRs7waeN2YmoZFCGXWASRYX1/rGHtXqEcrGEIDm+jqIwFa2fRXNgQEwrxaYuIrX0WcAguTA==
  dependencies:
    dot-case "^3.0.3"
    tslib "^1.10.0"

parent-module@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/parent-module/-/parent-module-1.0.1.tgz#691d2709e78c79fae3a156622452d00762caaaa2"
  integrity sha512-GQ2EWRpQV8/o+Aw8YqtfZZPfNRWZYkbidE9k5rpl/hC3vtHHBfGm2Ifi6qWV+coDGkrUKZAxE3Lot5kcsRlh+g==
  dependencies:
    callsites "^3.0.0"

parse-asn1@^5.0.0:
  version "5.1.5"
  resolved "https://registry.yarnpkg.com/parse-asn1/-/parse-asn1-5.1.5.tgz#003271343da58dc94cace494faef3d2147ecea0e"
  integrity sha512-jkMYn1dcJqF6d5CpU689bq7w/b5ALS9ROVSpQDPrZsqqesUJii9qutvoT5ltGedNXMO2e16YUWIghG9KxaViTQ==
  dependencies:
    asn1.js "^4.0.0"
    browserify-aes "^1.0.0"
    create-hash "^1.1.0"
    evp_bytestokey "^1.0.0"
    pbkdf2 "^3.0.3"
    safe-buffer "^5.1.1"

parse-json@^2.2.0:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/parse-json/-/parse-json-2.2.0.tgz#f480f40434ef80741f8469099f8dea18f55a4dc9"
  integrity sha1-9ID0BDTvgHQfhGkJn43qGPVaTck=
  dependencies:
    error-ex "^1.2.0"

parse-json@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/parse-json/-/parse-json-4.0.0.tgz#be35f5425be1f7f6c747184f98a788cb99477ee0"
  integrity sha1-vjX1Qlvh9/bHRxhPmKeIy5lHfuA=
  dependencies:
    error-ex "^1.3.1"
    json-parse-better-errors "^1.0.1"

parse-json@^5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/parse-json/-/parse-json-5.0.0.tgz#73e5114c986d143efa3712d4ea24db9a4266f60f"
  integrity sha512-OOY5b7PAEFV0E2Fir1KOkxchnZNCdowAJgQ5NuxjpBKTRP3pQhwkrkxqQjeoKJ+fO7bCpmIZaogI4eZGDMEGOw==
  dependencies:
    "@babel/code-frame" "^7.0.0"
    error-ex "^1.3.1"
    json-parse-better-errors "^1.0.1"
    lines-and-columns "^1.1.6"

parse5@4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/parse5/-/parse5-4.0.0.tgz#6d78656e3da8d78b4ec0b906f7c08ef1dfe3f608"
  integrity sha512-VrZ7eOd3T1Fk4XWNXMgiGBK/z0MG48BWG2uQNU4I72fkQuKUTZpl+u9k+CxEG0twMVzSmXEEz12z5Fnw1jIQFA==

parse5@5.1.0:
  version "5.1.0"
  resolved "https://registry.yarnpkg.com/parse5/-/parse5-5.1.0.tgz#c59341c9723f414c452975564c7c00a68d58acd2"
  integrity sha512-fxNG2sQjHvlVAYmzBZS9YlDp6PTSSDwa98vkD4QgVDDCAo84z5X1t5XyJQ62ImdLXx5NdIIfihey6xpum9/gRQ==

parseurl@~1.3.2, parseurl@~1.3.3:
  version "1.3.3"
  resolved "https://registry.yarnpkg.com/parseurl/-/parseurl-1.3.3.tgz#9da19e7bee8d12dff0513ed5b76957793bc2e8d4"
  integrity sha512-CiyeOxFT/JZyN5m0z9PfXw4SCBJ6Sygz1Dpl0wqjlhDEGGBP1GnsUVEL0p63hoG1fcj3fHynXi9NYO4nWOL+qQ==

pascal-case@^3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/pascal-case/-/pascal-case-3.1.1.tgz#5ac1975133ed619281e88920973d2cd1f279de5f"
  integrity sha512-XIeHKqIrsquVTQL2crjq3NfJUxmdLasn3TYOU0VBM+UX2a6ztAWBlJQBePLGY7VHW8+2dRadeIPK5+KImwTxQA==
  dependencies:
    no-case "^3.0.3"
    tslib "^1.10.0"

pascalcase@^0.1.1:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/pascalcase/-/pascalcase-0.1.1.tgz#b363e55e8006ca6fe21784d2db22bd15d7917f14"
  integrity sha1-s2PlXoAGym/iF4TS2yK9FdeRfxQ=

path-browserify@0.0.1:
  version "0.0.1"
  resolved "https://registry.yarnpkg.com/path-browserify/-/path-browserify-0.0.1.tgz#e6c4ddd7ed3aa27c68a20cc4e50e1a4ee83bbc4a"
  integrity sha512-BapA40NHICOS+USX9SN4tyhq+A2RrN/Ws5F0Z5aMHDp98Fl86lX8Oti8B7uN93L4Ifv4fHOEA+pQw87gmMO/lQ==

path-dirname@^1.0.0:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/path-dirname/-/path-dirname-1.0.2.tgz#cc33d24d525e099a5388c0336c6e32b9160609e0"
  integrity sha1-zDPSTVJeCZpTiMAzbG4yuRYGCeA=

path-exists@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/path-exists/-/path-exists-2.1.0.tgz#0feb6c64f0fc518d9a754dd5efb62c7022761f4b"
  integrity sha1-D+tsZPD8UY2adU3V77YscCJ2H0s=
  dependencies:
    pinkie-promise "^2.0.0"

path-exists@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/path-exists/-/path-exists-3.0.0.tgz#ce0ebeaa5f78cb18925ea7d810d7b59b010fd515"
  integrity sha1-zg6+ql94yxiSXqfYENe1mwEP1RU=

path-exists@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/path-exists/-/path-exists-4.0.0.tgz#513bdbe2d3b95d7762e8c1137efa195c6c61b5b3"
  integrity sha512-ak9Qy5Q7jYb2Wwcey5Fpvg2KoAc/ZIhLSLOSBmRmygPsGwkVVt0fZa0qrtMz+m6tJTAHfZQ8FnmB4MG4LWy7/w==

path-is-absolute@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/path-is-absolute/-/path-is-absolute-1.0.1.tgz#174b9268735534ffbc7ace6bf53a5a9e1b5c5f5f"
  integrity sha1-F0uSaHNVNP+8es5r9TpanhtcX18=

path-is-inside@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/path-is-inside/-/path-is-inside-1.0.2.tgz#365417dede44430d1c11af61027facf074bdfc53"
  integrity sha1-NlQX3t5EQw0cEa9hAn+s8HS9/FM=

path-key@^2.0.0, path-key@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/path-key/-/path-key-2.0.1.tgz#411cadb574c5a140d3a4b1910d40d80cc9f40b40"
  integrity sha1-QRyttXTFoUDTpLGRDUDYDMn0C0A=

path-key@^3.1.0:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/path-key/-/path-key-3.1.1.tgz#581f6ade658cbba65a0d3380de7753295054f375"
  integrity sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==

path-parse@^1.0.6:
  version "1.0.6"
  resolved "https://registry.yarnpkg.com/path-parse/-/path-parse-1.0.6.tgz#d62dbb5679405d72c4737ec58600e9ddcf06d24c"
  integrity sha512-GSmOT2EbHrINBf9SR7CDELwlJ8AENk3Qn7OikK4nFYAu3Ote2+JYNVvkpAEQm3/TLNEJFD/xZJjzyxg3KBWOzw==

path-to-regexp@0.1.7:
  version "0.1.7"
  resolved "https://registry.yarnpkg.com/path-to-regexp/-/path-to-regexp-0.1.7.tgz#df604178005f522f15eb4490e7247a1bfaa67f8c"
  integrity sha1-32BBeABfUi8V60SQ5yR6G/qmf4w=

path-type@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/path-type/-/path-type-2.0.0.tgz#f012ccb8415b7096fc2daa1054c3d72389594c73"
  integrity sha1-8BLMuEFbcJb8LaoQVMPXI4lZTHM=
  dependencies:
    pify "^2.0.0"

path-type@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/path-type/-/path-type-3.0.0.tgz#cef31dc8e0a1a3bb0d105c0cd97cf3bf47f4e36f"
  integrity sha512-T2ZUsdZFHgA3u4e5PfPbjd7HDDpxPnQb5jN0SrDsjNSuVXHJqtwTnWqG0B1jZrgmJ/7lj1EmVIByWt1gxGkWvg==
  dependencies:
    pify "^3.0.0"

path-type@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/path-type/-/path-type-4.0.0.tgz#84ed01c0a7ba380afe09d90a8c180dcd9d03043b"
  integrity sha512-gDKb8aZMDeD/tZWs9P6+q0J9Mwkdl6xMV8TjnGP3qJVJ06bdMgkbBlLU8IdfOsIsFz2BW1rNVT3XuNEl8zPAvw==

pbkdf2@^3.0.3:
  version "3.0.17"
  resolved "https://registry.yarnpkg.com/pbkdf2/-/pbkdf2-3.0.17.tgz#976c206530617b14ebb32114239f7b09336e93a6"
  integrity sha512-U/il5MsrZp7mGg3mSQfn742na2T+1/vHDCG5/iTI3X9MKUuYUZVLQhyRsg06mCgDBTd57TxzgZt7P+fYfjRLtA==
  dependencies:
    create-hash "^1.1.2"
    create-hmac "^1.1.4"
    ripemd160 "^2.0.1"
    safe-buffer "^5.0.1"
    sha.js "^2.4.8"

performance-now@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/performance-now/-/performance-now-2.1.0.tgz#6309f4e0e5fa913ec1c69307ae364b4b377c9e7b"
  integrity sha1-Ywn04OX6kT7BxpMHrjZLSzd8nns=

picomatch@^2.0.4, picomatch@^2.0.7:
  version "2.2.1"
  resolved "https://registry.yarnpkg.com/picomatch/-/picomatch-2.2.1.tgz#21bac888b6ed8601f831ce7816e335bc779f0a4a"
  integrity sha512-ISBaA8xQNmwELC7eOjqFKMESB2VIqt4PPDD0nsS95b/9dZXvVKOlz9keMSnoGGKcOHXfTvDD6WMaRoSc9UuhRA==

pify@^2.0.0:
  version "2.3.0"
  resolved "https://registry.yarnpkg.com/pify/-/pify-2.3.0.tgz#ed141a6ac043a849ea588498e7dca8b15330e90c"
  integrity sha1-7RQaasBDqEnqWISY59yosVMw6Qw=

pify@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/pify/-/pify-3.0.0.tgz#e5a4acd2c101fdf3d9a4d07f0dbc4db49dd28176"
  integrity sha1-5aSs0sEB/fPZpNB/DbxNtJ3SgXY=

pify@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/pify/-/pify-4.0.1.tgz#4b2cd25c50d598735c50292224fd8c6df41e3231"
  integrity sha512-uB80kBFb/tfd68bVleG9T5GGsGPjJrLAUpR5PZIrhBnIaRTQRjqdJSsIKkOP6OAIFbj7GOrcudc5pNjZ+geV2g==

pinkie-promise@^2.0.0:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/pinkie-promise/-/pinkie-promise-2.0.1.tgz#2135d6dfa7a358c069ac9b178776288228450ffa"
  integrity sha1-ITXW36ejWMBprJsXh3YogihFD/o=
  dependencies:
    pinkie "^2.0.0"

pinkie@^2.0.0:
  version "2.0.4"
  resolved "https://registry.yarnpkg.com/pinkie/-/pinkie-2.0.4.tgz#72556b80cfa0d48a974e80e77248e80ed4f7f870"
  integrity sha1-clVrgM+g1IqXToDnckjoDtT3+HA=

pirates@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/pirates/-/pirates-4.0.1.tgz#643a92caf894566f91b2b986d2c66950a8e2fb87"
  integrity sha512-WuNqLTbMI3tmfef2TKxlQmAiLHKtFhlsCZnPIpuv2Ow0RDVO8lfy1Opf4NUzlMXLjPl+Men7AuVdX6TA+s+uGA==
  dependencies:
    node-modules-regexp "^1.0.0"

pkg-dir@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/pkg-dir/-/pkg-dir-1.0.0.tgz#7a4b508a8d5bb2d629d447056ff4e9c9314cf3d4"
  integrity sha1-ektQio1bstYp1EcFb/TpyTFM89Q=
  dependencies:
    find-up "^1.0.0"

pkg-dir@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/pkg-dir/-/pkg-dir-2.0.0.tgz#f6d5d1109e19d63edf428e0bd57e12777615334b"
  integrity sha1-9tXREJ4Z1j7fQo4L1X4Sd3YVM0s=
  dependencies:
    find-up "^2.1.0"

pkg-dir@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/pkg-dir/-/pkg-dir-3.0.0.tgz#2749020f239ed990881b1f71210d51eb6523bea3"
  integrity sha512-/E57AYkoeQ25qkxMj5PBOVgF8Kiu/h7cYS30Z5+R7WaiCCBfLq58ZI/dSeaEKb9WVJV5n/03QwrN3IeWIFllvw==
  dependencies:
    find-up "^3.0.0"

pkg-dir@^4.1.0:
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/pkg-dir/-/pkg-dir-4.2.0.tgz#f099133df7ede422e81d1d8448270eeb3e4261f3"
  integrity sha512-HRDzbaKjC+AOWVXxAU/x54COGeIv9eb+6CkDSQoNTt4XyWoIJvuPsXizxu/Fr23EiekbtZwmh1IcIG/l/a10GQ==
  dependencies:
    find-up "^4.0.0"

pkg-up@3.1.0, pkg-up@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/pkg-up/-/pkg-up-3.1.0.tgz#100ec235cc150e4fd42519412596a28512a0def5"
  integrity sha512-nDywThFk1i4BQK4twPQ6TA4RT8bDY96yeuCVBWL3ePARCiEKDRSrNGbFIgUJpLp+XeIR65v8ra7WuJOFUBtkMA==
  dependencies:
    find-up "^3.0.0"

pn@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/pn/-/pn-1.1.0.tgz#e2f4cef0e219f463c179ab37463e4e1ecdccbafb"
  integrity sha512-2qHaIQr2VLRFoxe2nASzsV6ef4yOOH+Fi9FBOVH6cqeSgUnoyySPZkxzLuzd+RYOQTRpROA0ztTMqxROKSb/nA==

pnp-webpack-plugin@1.6.4:
  version "1.6.4"
  resolved "https://registry.yarnpkg.com/pnp-webpack-plugin/-/pnp-webpack-plugin-1.6.4.tgz#c9711ac4dc48a685dabafc86f8b6dd9f8df84149"
  integrity sha512-7Wjy+9E3WwLOEL30D+m8TSTF7qJJUJLONBnwQp0518siuMxUQUbgZwssaFX+QKlZkjHZcw/IpZCt/H0srrntSg==
  dependencies:
    ts-pnp "^1.1.6"

portfinder@^1.0.25:
  version "1.0.25"
  resolved "https://registry.yarnpkg.com/portfinder/-/portfinder-1.0.25.tgz#254fd337ffba869f4b9d37edc298059cb4d35eca"
  integrity sha512-6ElJnHBbxVA1XSLgBp7G1FiCkQdlqGzuF7DswL5tcea+E8UpuvPU7beVAjjRwCioTS9ZluNbu+ZyRvgTsmqEBg==
  dependencies:
    async "^2.6.2"
    debug "^3.1.1"
    mkdirp "^0.5.1"

posix-character-classes@^0.1.0:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/posix-character-classes/-/posix-character-classes-0.1.1.tgz#01eac0fe3b5af71a2a6c02feabb8c1fef7e00eab"
  integrity sha1-AerA/jta9xoqbAL+q7jB/vfgDqs=

postcss-attribute-case-insensitive@^4.0.1:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-attribute-case-insensitive/-/postcss-attribute-case-insensitive-4.0.2.tgz#d93e46b504589e94ac7277b0463226c68041a880"
  integrity sha512-clkFxk/9pcdb4Vkn0hAHq3YnxBQ2p0CGD1dy24jN+reBck+EWxMbxSUqN4Yj7t0w8csl87K6p0gxBe1utkJsYA==
  dependencies:
    postcss "^7.0.2"
    postcss-selector-parser "^6.0.2"

postcss-browser-comments@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/postcss-browser-comments/-/postcss-browser-comments-3.0.0.tgz#1248d2d935fb72053c8e1f61a84a57292d9f65e9"
  integrity sha512-qfVjLfq7HFd2e0HW4s1dvU8X080OZdG46fFbIBFjW7US7YPDcWfRvdElvwMJr2LI6hMmD+7LnH2HcmXTs+uOig==
  dependencies:
    postcss "^7"

postcss-calc@^7.0.1:
  version "7.0.2"
  resolved "https://registry.yarnpkg.com/postcss-calc/-/postcss-calc-7.0.2.tgz#504efcd008ca0273120568b0792b16cdcde8aac1"
  integrity sha512-rofZFHUg6ZIrvRwPeFktv06GdbDYLcGqh9EwiMutZg+a0oePCCw1zHOEiji6LCpyRcjTREtPASuUqeAvYlEVvQ==
  dependencies:
    postcss "^7.0.27"
    postcss-selector-parser "^6.0.2"
    postcss-value-parser "^4.0.2"

postcss-color-functional-notation@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/postcss-color-functional-notation/-/postcss-color-functional-notation-2.0.1.tgz#5efd37a88fbabeb00a2966d1e53d98ced93f74e0"
  integrity sha512-ZBARCypjEDofW4P6IdPVTLhDNXPRn8T2s1zHbZidW6rPaaZvcnCS2soYFIQJrMZSxiePJ2XIYTlcb2ztr/eT2g==
  dependencies:
    postcss "^7.0.2"
    postcss-values-parser "^2.0.0"

postcss-color-gray@^5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/postcss-color-gray/-/postcss-color-gray-5.0.0.tgz#532a31eb909f8da898ceffe296fdc1f864be8547"
  integrity sha512-q6BuRnAGKM/ZRpfDascZlIZPjvwsRye7UDNalqVz3s7GDxMtqPY6+Q871liNxsonUw8oC61OG+PSaysYpl1bnw==
  dependencies:
    "@csstools/convert-colors" "^1.4.0"
    postcss "^7.0.5"
    postcss-values-parser "^2.0.0"

postcss-color-hex-alpha@^5.0.3:
  version "5.0.3"
  resolved "https://registry.yarnpkg.com/postcss-color-hex-alpha/-/postcss-color-hex-alpha-5.0.3.tgz#a8d9ca4c39d497c9661e374b9c51899ef0f87388"
  integrity sha512-PF4GDel8q3kkreVXKLAGNpHKilXsZ6xuu+mOQMHWHLPNyjiUBOr75sp5ZKJfmv1MCus5/DWUGcK9hm6qHEnXYw==
  dependencies:
    postcss "^7.0.14"
    postcss-values-parser "^2.0.1"

postcss-color-mod-function@^3.0.3:
  version "3.0.3"
  resolved "https://registry.yarnpkg.com/postcss-color-mod-function/-/postcss-color-mod-function-3.0.3.tgz#816ba145ac11cc3cb6baa905a75a49f903e4d31d"
  integrity sha512-YP4VG+xufxaVtzV6ZmhEtc+/aTXH3d0JLpnYfxqTvwZPbJhWqp8bSY3nfNzNRFLgB4XSaBA82OE4VjOOKpCdVQ==
  dependencies:
    "@csstools/convert-colors" "^1.4.0"
    postcss "^7.0.2"
    postcss-values-parser "^2.0.0"

postcss-color-rebeccapurple@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-color-rebeccapurple/-/postcss-color-rebeccapurple-4.0.1.tgz#c7a89be872bb74e45b1e3022bfe5748823e6de77"
  integrity sha512-aAe3OhkS6qJXBbqzvZth2Au4V3KieR5sRQ4ptb2b2O8wgvB3SJBsdG+jsn2BZbbwekDG8nTfcCNKcSfe/lEy8g==
  dependencies:
    postcss "^7.0.2"
    postcss-values-parser "^2.0.0"

postcss-colormin@^4.0.3:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/postcss-colormin/-/postcss-colormin-4.0.3.tgz#ae060bce93ed794ac71264f08132d550956bd381"
  integrity sha512-WyQFAdDZpExQh32j0U0feWisZ0dmOtPl44qYmJKkq9xFWY3p+4qnRzCHeNrkeRhwPHz9bQ3mo0/yVkaply0MNw==
  dependencies:
    browserslist "^4.0.0"
    color "^3.0.0"
    has "^1.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-convert-values@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-convert-values/-/postcss-convert-values-4.0.1.tgz#ca3813ed4da0f812f9d43703584e449ebe189a7f"
  integrity sha512-Kisdo1y77KUC0Jmn0OXU/COOJbzM8cImvw1ZFsBgBgMgb1iL23Zs/LXRe3r+EZqM3vGYKdQ2YJVQ5VkJI+zEJQ==
  dependencies:
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-custom-media@^7.0.8:
  version "7.0.8"
  resolved "https://registry.yarnpkg.com/postcss-custom-media/-/postcss-custom-media-7.0.8.tgz#fffd13ffeffad73621be5f387076a28b00294e0c"
  integrity sha512-c9s5iX0Ge15o00HKbuRuTqNndsJUbaXdiNsksnVH8H4gdc+zbLzr/UasOwNG6CTDpLFekVY4672eWdiiWu2GUg==
  dependencies:
    postcss "^7.0.14"

postcss-custom-properties@^8.0.11:
  version "8.0.11"
  resolved "https://registry.yarnpkg.com/postcss-custom-properties/-/postcss-custom-properties-8.0.11.tgz#2d61772d6e92f22f5e0d52602df8fae46fa30d97"
  integrity sha512-nm+o0eLdYqdnJ5abAJeXp4CEU1c1k+eB2yMCvhgzsds/e0umabFrN6HoTy/8Q4K5ilxERdl/JD1LO5ANoYBeMA==
  dependencies:
    postcss "^7.0.17"
    postcss-values-parser "^2.0.1"

postcss-custom-selectors@^5.1.2:
  version "5.1.2"
  resolved "https://registry.yarnpkg.com/postcss-custom-selectors/-/postcss-custom-selectors-5.1.2.tgz#64858c6eb2ecff2fb41d0b28c9dd7b3db4de7fba"
  integrity sha512-DSGDhqinCqXqlS4R7KGxL1OSycd1lydugJ1ky4iRXPHdBRiozyMHrdu0H3o7qNOCiZwySZTUI5MV0T8QhCLu+w==
  dependencies:
    postcss "^7.0.2"
    postcss-selector-parser "^5.0.0-rc.3"

postcss-dir-pseudo-class@^5.0.0:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/postcss-dir-pseudo-class/-/postcss-dir-pseudo-class-5.0.0.tgz#6e3a4177d0edb3abcc85fdb6fbb1c26dabaeaba2"
  integrity sha512-3pm4oq8HYWMZePJY+5ANriPs3P07q+LW6FAdTlkFH2XqDdP4HeeJYMOzn0HYLhRSjBO3fhiqSwwU9xEULSrPgw==
  dependencies:
    postcss "^7.0.2"
    postcss-selector-parser "^5.0.0-rc.3"

postcss-discard-comments@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-discard-comments/-/postcss-discard-comments-4.0.2.tgz#1fbabd2c246bff6aaad7997b2b0918f4d7af4033"
  integrity sha512-RJutN259iuRf3IW7GZyLM5Sw4GLTOH8FmsXBnv8Ab/Tc2k4SR4qbV4DNbyyY4+Sjo362SyDmW2DQ7lBSChrpkg==
  dependencies:
    postcss "^7.0.0"

postcss-discard-duplicates@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-discard-duplicates/-/postcss-discard-duplicates-4.0.2.tgz#3fe133cd3c82282e550fc9b239176a9207b784eb"
  integrity sha512-ZNQfR1gPNAiXZhgENFfEglF93pciw0WxMkJeVmw8eF+JZBbMD7jp6C67GqJAXVZP2BWbOztKfbsdmMp/k8c6oQ==
  dependencies:
    postcss "^7.0.0"

postcss-discard-empty@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-discard-empty/-/postcss-discard-empty-4.0.1.tgz#c8c951e9f73ed9428019458444a02ad90bb9f765"
  integrity sha512-B9miTzbznhDjTfjvipfHoqbWKwd0Mj+/fL5s1QOz06wufguil+Xheo4XpOnc4NqKYBCNqqEzgPv2aPBIJLox0w==
  dependencies:
    postcss "^7.0.0"

postcss-discard-overridden@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-discard-overridden/-/postcss-discard-overridden-4.0.1.tgz#652aef8a96726f029f5e3e00146ee7a4e755ff57"
  integrity sha512-IYY2bEDD7g1XM1IDEsUT4//iEYCxAmP5oDSFMVU/JVvT7gh+l4fmjciLqGgwjdWpQIdb0Che2VX00QObS5+cTg==
  dependencies:
    postcss "^7.0.0"

postcss-double-position-gradients@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/postcss-double-position-gradients/-/postcss-double-position-gradients-1.0.0.tgz#fc927d52fddc896cb3a2812ebc5df147e110522e"
  integrity sha512-G+nV8EnQq25fOI8CH/B6krEohGWnF5+3A6H/+JEpOncu5dCnkS1QQ6+ct3Jkaepw1NGVqqOZH6lqrm244mCftA==
  dependencies:
    postcss "^7.0.5"
    postcss-values-parser "^2.0.0"

postcss-env-function@^2.0.2:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/postcss-env-function/-/postcss-env-function-2.0.2.tgz#0f3e3d3c57f094a92c2baf4b6241f0b0da5365d7"
  integrity sha512-rwac4BuZlITeUbiBq60h/xbLzXY43qOsIErngWa4l7Mt+RaSkT7QBjXVGTcBHupykkblHMDrBFh30zchYPaOUw==
  dependencies:
    postcss "^7.0.2"
    postcss-values-parser "^2.0.0"

postcss-flexbugs-fixes@4.1.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/postcss-flexbugs-fixes/-/postcss-flexbugs-fixes-4.1.0.tgz#e094a9df1783e2200b7b19f875dcad3b3aff8b20"
  integrity sha512-jr1LHxQvStNNAHlgco6PzY308zvLklh7SJVYuWUwyUQncofaAlD2l+P/gxKHOdqWKe7xJSkVLFF/2Tp+JqMSZA==
  dependencies:
    postcss "^7.0.0"

postcss-focus-visible@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/postcss-focus-visible/-/postcss-focus-visible-4.0.0.tgz#477d107113ade6024b14128317ade2bd1e17046e"
  integrity sha512-Z5CkWBw0+idJHSV6+Bgf2peDOFf/x4o+vX/pwcNYrWpXFrSfTkQ3JQ1ojrq9yS+upnAlNRHeg8uEwFTgorjI8g==
  dependencies:
    postcss "^7.0.2"

postcss-focus-within@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/postcss-focus-within/-/postcss-focus-within-3.0.0.tgz#763b8788596cee9b874c999201cdde80659ef680"
  integrity sha512-W0APui8jQeBKbCGZudW37EeMCjDeVxKgiYfIIEo8Bdh5SpB9sxds/Iq8SEuzS0Q4YFOlG7EPFulbbxujpkrV2w==
  dependencies:
    postcss "^7.0.2"

postcss-font-variant@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/postcss-font-variant/-/postcss-font-variant-4.0.0.tgz#71dd3c6c10a0d846c5eda07803439617bbbabacc"
  integrity sha512-M8BFYKOvCrI2aITzDad7kWuXXTm0YhGdP9Q8HanmN4EF1Hmcgs1KK5rSHylt/lUJe8yLxiSwWAHdScoEiIxztg==
  dependencies:
    postcss "^7.0.2"

postcss-gap-properties@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/postcss-gap-properties/-/postcss-gap-properties-2.0.0.tgz#431c192ab3ed96a3c3d09f2ff615960f902c1715"
  integrity sha512-QZSqDaMgXCHuHTEzMsS2KfVDOq7ZFiknSpkrPJY6jmxbugUPTuSzs/vuE5I3zv0WAS+3vhrlqhijiprnuQfzmg==
  dependencies:
    postcss "^7.0.2"

postcss-image-set-function@^3.0.1:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/postcss-image-set-function/-/postcss-image-set-function-3.0.1.tgz#28920a2f29945bed4c3198d7df6496d410d3f288"
  integrity sha512-oPTcFFip5LZy8Y/whto91L9xdRHCWEMs3e1MdJxhgt4jy2WYXfhkng59fH5qLXSCPN8k4n94p1Czrfe5IOkKUw==
  dependencies:
    postcss "^7.0.2"
    postcss-values-parser "^2.0.0"

postcss-initial@^3.0.0:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/postcss-initial/-/postcss-initial-3.0.2.tgz#f018563694b3c16ae8eaabe3c585ac6319637b2d"
  integrity sha512-ugA2wKonC0xeNHgirR4D3VWHs2JcU08WAi1KFLVcnb7IN89phID6Qtg2RIctWbnvp1TM2BOmDtX8GGLCKdR8YA==
  dependencies:
    lodash.template "^4.5.0"
    postcss "^7.0.2"

postcss-lab-function@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/postcss-lab-function/-/postcss-lab-function-2.0.1.tgz#bb51a6856cd12289ab4ae20db1e3821ef13d7d2e"
  integrity sha512-whLy1IeZKY+3fYdqQFuDBf8Auw+qFuVnChWjmxm/UhHWqNHZx+B99EwxTvGYmUBqe3Fjxs4L1BoZTJmPu6usVg==
  dependencies:
    "@csstools/convert-colors" "^1.4.0"
    postcss "^7.0.2"
    postcss-values-parser "^2.0.0"

postcss-load-config@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/postcss-load-config/-/postcss-load-config-2.1.0.tgz#c84d692b7bb7b41ddced94ee62e8ab31b417b003"
  integrity sha512-4pV3JJVPLd5+RueiVVB+gFOAa7GWc25XQcMp86Zexzke69mKf6Nx9LRcQywdz7yZI9n1udOxmLuAwTBypypF8Q==
  dependencies:
    cosmiconfig "^5.0.0"
    import-cwd "^2.0.0"

postcss-loader@3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/postcss-loader/-/postcss-loader-3.0.0.tgz#6b97943e47c72d845fa9e03f273773d4e8dd6c2d"
  integrity sha512-cLWoDEY5OwHcAjDnkyRQzAXfs2jrKjXpO/HQFcc5b5u/r7aa471wdmChmwfnv7x2u840iat/wi0lQ5nbRgSkUA==
  dependencies:
    loader-utils "^1.1.0"
    postcss "^7.0.0"
    postcss-load-config "^2.0.0"
    schema-utils "^1.0.0"

postcss-logical@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/postcss-logical/-/postcss-logical-3.0.0.tgz#2495d0f8b82e9f262725f75f9401b34e7b45d5b5"
  integrity sha512-1SUKdJc2vuMOmeItqGuNaC+N8MzBWFWEkAnRnLpFYj1tGGa7NqyVBujfRtgNa2gXR+6RkGUiB2O5Vmh7E2RmiA==
  dependencies:
    postcss "^7.0.2"

postcss-media-minmax@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/postcss-media-minmax/-/postcss-media-minmax-4.0.0.tgz#b75bb6cbc217c8ac49433e12f22048814a4f5ed5"
  integrity sha512-fo9moya6qyxsjbFAYl97qKO9gyre3qvbMnkOZeZwlsW6XYFsvs2DMGDlchVLfAd8LHPZDxivu/+qW2SMQeTHBw==
  dependencies:
    postcss "^7.0.2"

postcss-merge-longhand@^4.0.11:
  version "4.0.11"
  resolved "https://registry.yarnpkg.com/postcss-merge-longhand/-/postcss-merge-longhand-4.0.11.tgz#62f49a13e4a0ee04e7b98f42bb16062ca2549e24"
  integrity sha512-alx/zmoeXvJjp7L4mxEMjh8lxVlDFX1gqWHzaaQewwMZiVhLo42TEClKaeHbRf6J7j82ZOdTJ808RtN0ZOZwvw==
  dependencies:
    css-color-names "0.0.4"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"
    stylehacks "^4.0.0"

postcss-merge-rules@^4.0.3:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/postcss-merge-rules/-/postcss-merge-rules-4.0.3.tgz#362bea4ff5a1f98e4075a713c6cb25aefef9a650"
  integrity sha512-U7e3r1SbvYzO0Jr3UT/zKBVgYYyhAz0aitvGIYOYK5CPmkNih+WDSsS5tvPrJ8YMQYlEMvsZIiqmn7HdFUaeEQ==
  dependencies:
    browserslist "^4.0.0"
    caniuse-api "^3.0.0"
    cssnano-util-same-parent "^4.0.0"
    postcss "^7.0.0"
    postcss-selector-parser "^3.0.0"
    vendors "^1.0.0"

postcss-minify-font-values@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-minify-font-values/-/postcss-minify-font-values-4.0.2.tgz#cd4c344cce474343fac5d82206ab2cbcb8afd5a6"
  integrity sha512-j85oO6OnRU9zPf04+PZv1LYIYOprWm6IA6zkXkrJXyRveDEuQggG6tvoy8ir8ZwjLxLuGfNkCZEQG7zan+Hbtg==
  dependencies:
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-minify-gradients@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-minify-gradients/-/postcss-minify-gradients-4.0.2.tgz#93b29c2ff5099c535eecda56c4aa6e665a663471"
  integrity sha512-qKPfwlONdcf/AndP1U8SJ/uzIJtowHlMaSioKzebAXSG4iJthlWC9iSWznQcX4f66gIWX44RSA841HTHj3wK+Q==
  dependencies:
    cssnano-util-get-arguments "^4.0.0"
    is-color-stop "^1.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-minify-params@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-minify-params/-/postcss-minify-params-4.0.2.tgz#6b9cef030c11e35261f95f618c90036d680db874"
  integrity sha512-G7eWyzEx0xL4/wiBBJxJOz48zAKV2WG3iZOqVhPet/9geefm/Px5uo1fzlHu+DOjT+m0Mmiz3jkQzVHe6wxAWg==
  dependencies:
    alphanum-sort "^1.0.0"
    browserslist "^4.0.0"
    cssnano-util-get-arguments "^4.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"
    uniqs "^2.0.0"

postcss-minify-selectors@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-minify-selectors/-/postcss-minify-selectors-4.0.2.tgz#e2e5eb40bfee500d0cd9243500f5f8ea4262fbd8"
  integrity sha512-D5S1iViljXBj9kflQo4YutWnJmwm8VvIsU1GeXJGiG9j8CIg9zs4voPMdQDUmIxetUOh60VilsNzCiAFTOqu3g==
  dependencies:
    alphanum-sort "^1.0.0"
    has "^1.0.0"
    postcss "^7.0.0"
    postcss-selector-parser "^3.0.0"

postcss-modules-extract-imports@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/postcss-modules-extract-imports/-/postcss-modules-extract-imports-2.0.0.tgz#818719a1ae1da325f9832446b01136eeb493cd7e"
  integrity sha512-LaYLDNS4SG8Q5WAWqIJgdHPJrDDr/Lv775rMBFUbgjTz6j34lUznACHcdRWroPvXANP2Vj7yNK57vp9eFqzLWQ==
  dependencies:
    postcss "^7.0.5"

postcss-modules-local-by-default@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/postcss-modules-local-by-default/-/postcss-modules-local-by-default-3.0.2.tgz#e8a6561be914aaf3c052876377524ca90dbb7915"
  integrity sha512-jM/V8eqM4oJ/22j0gx4jrp63GSvDH6v86OqyTHHUvk4/k1vceipZsaymiZ5PvocqZOl5SFHiFJqjs3la0wnfIQ==
  dependencies:
    icss-utils "^4.1.1"
    postcss "^7.0.16"
    postcss-selector-parser "^6.0.2"
    postcss-value-parser "^4.0.0"

postcss-modules-scope@^2.1.1:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/postcss-modules-scope/-/postcss-modules-scope-2.2.0.tgz#385cae013cc7743f5a7d7602d1073a89eaae62ee"
  integrity sha512-YyEgsTMRpNd+HmyC7H/mh3y+MeFWevy7V1evVhJWewmMbjDHIbZbOXICC2y+m1xI1UVfIT1HMW/O04Hxyu9oXQ==
  dependencies:
    postcss "^7.0.6"
    postcss-selector-parser "^6.0.0"

postcss-modules-values@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/postcss-modules-values/-/postcss-modules-values-3.0.0.tgz#5b5000d6ebae29b4255301b4a3a54574423e7f10"
  integrity sha512-1//E5jCBrZ9DmRX+zCtmQtRSV6PV42Ix7Bzj9GbwJceduuf7IqP8MgeTXuRDHOWj2m0VzZD5+roFWDuU8RQjcg==
  dependencies:
    icss-utils "^4.0.0"
    postcss "^7.0.6"

postcss-nesting@^7.0.0:
  version "7.0.1"
  resolved "https://registry.yarnpkg.com/postcss-nesting/-/postcss-nesting-7.0.1.tgz#b50ad7b7f0173e5b5e3880c3501344703e04c052"
  integrity sha512-FrorPb0H3nuVq0Sff7W2rnc3SmIcruVC6YwpcS+k687VxyxO33iE1amna7wHuRVzM8vfiYofXSBHNAZ3QhLvYg==
  dependencies:
    postcss "^7.0.2"

postcss-normalize-charset@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-normalize-charset/-/postcss-normalize-charset-4.0.1.tgz#8b35add3aee83a136b0471e0d59be58a50285dd4"
  integrity sha512-gMXCrrlWh6G27U0hF3vNvR3w8I1s2wOBILvA87iNXaPvSNo5uZAMYsZG7XjCUf1eVxuPfyL4TJ7++SGZLc9A3g==
  dependencies:
    postcss "^7.0.0"

postcss-normalize-display-values@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-normalize-display-values/-/postcss-normalize-display-values-4.0.2.tgz#0dbe04a4ce9063d4667ed2be476bb830c825935a"
  integrity sha512-3F2jcsaMW7+VtRMAqf/3m4cPFhPD3EFRgNs18u+k3lTJJlVe7d0YPO+bnwqo2xg8YiRpDXJI2u8A0wqJxMsQuQ==
  dependencies:
    cssnano-util-get-match "^4.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize-positions@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-normalize-positions/-/postcss-normalize-positions-4.0.2.tgz#05f757f84f260437378368a91f8932d4b102917f"
  integrity sha512-Dlf3/9AxpxE+NF1fJxYDeggi5WwV35MXGFnnoccP/9qDtFrTArZ0D0R+iKcg5WsUd8nUYMIl8yXDCtcrT8JrdA==
  dependencies:
    cssnano-util-get-arguments "^4.0.0"
    has "^1.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize-repeat-style@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-normalize-repeat-style/-/postcss-normalize-repeat-style-4.0.2.tgz#c4ebbc289f3991a028d44751cbdd11918b17910c"
  integrity sha512-qvigdYYMpSuoFs3Is/f5nHdRLJN/ITA7huIoCyqqENJe9PvPmLhNLMu7QTjPdtnVf6OcYYO5SHonx4+fbJE1+Q==
  dependencies:
    cssnano-util-get-arguments "^4.0.0"
    cssnano-util-get-match "^4.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize-string@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-normalize-string/-/postcss-normalize-string-4.0.2.tgz#cd44c40ab07a0c7a36dc5e99aace1eca4ec2690c"
  integrity sha512-RrERod97Dnwqq49WNz8qo66ps0swYZDSb6rM57kN2J+aoyEAJfZ6bMx0sx/F9TIEX0xthPGCmeyiam/jXif0eA==
  dependencies:
    has "^1.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize-timing-functions@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-normalize-timing-functions/-/postcss-normalize-timing-functions-4.0.2.tgz#8e009ca2a3949cdaf8ad23e6b6ab99cb5e7d28d9"
  integrity sha512-acwJY95edP762e++00Ehq9L4sZCEcOPyaHwoaFOhIwWCDfik6YvqsYNxckee65JHLKzuNSSmAdxwD2Cud1Z54A==
  dependencies:
    cssnano-util-get-match "^4.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize-unicode@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-normalize-unicode/-/postcss-normalize-unicode-4.0.1.tgz#841bd48fdcf3019ad4baa7493a3d363b52ae1cfb"
  integrity sha512-od18Uq2wCYn+vZ/qCOeutvHjB5jm57ToxRaMeNuf0nWVHaP9Hua56QyMF6fs/4FSUnVIw0CBPsU0K4LnBPwYwg==
  dependencies:
    browserslist "^4.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize-url@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-normalize-url/-/postcss-normalize-url-4.0.1.tgz#10e437f86bc7c7e58f7b9652ed878daaa95faae1"
  integrity sha512-p5oVaF4+IHwu7VpMan/SSpmpYxcJMtkGppYf0VbdH5B6hN8YNmVyJLuY9FmLQTzY3fag5ESUUHDqM+heid0UVA==
  dependencies:
    is-absolute-url "^2.0.0"
    normalize-url "^3.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize-whitespace@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-normalize-whitespace/-/postcss-normalize-whitespace-4.0.2.tgz#bf1d4070fe4fcea87d1348e825d8cc0c5faa7d82"
  integrity sha512-tO8QIgrsI3p95r8fyqKV+ufKlSHh9hMJqACqbv2XknufqEDhDvbguXGBBqxw9nsQoXWf0qOqppziKJKHMD4GtA==
  dependencies:
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-normalize@8.0.1:
  version "8.0.1"
  resolved "https://registry.yarnpkg.com/postcss-normalize/-/postcss-normalize-8.0.1.tgz#90e80a7763d7fdf2da6f2f0f82be832ce4f66776"
  integrity sha512-rt9JMS/m9FHIRroDDBGSMsyW1c0fkvOJPy62ggxSHUldJO7B195TqFMqIf+lY5ezpDcYOV4j86aUp3/XbxzCCQ==
  dependencies:
    "@csstools/normalize.css" "^10.1.0"
    browserslist "^4.6.2"
    postcss "^7.0.17"
    postcss-browser-comments "^3.0.0"
    sanitize.css "^10.0.0"

postcss-ordered-values@^4.1.2:
  version "4.1.2"
  resolved "https://registry.yarnpkg.com/postcss-ordered-values/-/postcss-ordered-values-4.1.2.tgz#0cf75c820ec7d5c4d280189559e0b571ebac0eee"
  integrity sha512-2fCObh5UanxvSxeXrtLtlwVThBvHn6MQcu4ksNT2tsaV2Fg76R2CV98W7wNSlX+5/pFwEyaDwKLLoEV7uRybAw==
  dependencies:
    cssnano-util-get-arguments "^4.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-overflow-shorthand@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/postcss-overflow-shorthand/-/postcss-overflow-shorthand-2.0.0.tgz#31ecf350e9c6f6ddc250a78f0c3e111f32dd4c30"
  integrity sha512-aK0fHc9CBNx8jbzMYhshZcEv8LtYnBIRYQD5i7w/K/wS9c2+0NSR6B3OVMu5y0hBHYLcMGjfU+dmWYNKH0I85g==
  dependencies:
    postcss "^7.0.2"

postcss-page-break@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/postcss-page-break/-/postcss-page-break-2.0.0.tgz#add52d0e0a528cabe6afee8b46e2abb277df46bf"
  integrity sha512-tkpTSrLpfLfD9HvgOlJuigLuk39wVTbbd8RKcy8/ugV2bNBUW3xU+AIqyxhDrQr1VUj1RmyJrBn1YWrqUm9zAQ==
  dependencies:
    postcss "^7.0.2"

postcss-place@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-place/-/postcss-place-4.0.1.tgz#e9f39d33d2dc584e46ee1db45adb77ca9d1dcc62"
  integrity sha512-Zb6byCSLkgRKLODj/5mQugyuj9bvAAw9LqJJjgwz5cYryGeXfFZfSXoP1UfveccFmeq0b/2xxwcTEVScnqGxBg==
  dependencies:
    postcss "^7.0.2"
    postcss-values-parser "^2.0.0"

postcss-preset-env@6.7.0:
  version "6.7.0"
  resolved "https://registry.yarnpkg.com/postcss-preset-env/-/postcss-preset-env-6.7.0.tgz#c34ddacf8f902383b35ad1e030f178f4cdf118a5"
  integrity sha512-eU4/K5xzSFwUFJ8hTdTQzo2RBLbDVt83QZrAvI07TULOkmyQlnYlpwep+2yIK+K+0KlZO4BvFcleOCCcUtwchg==
  dependencies:
    autoprefixer "^9.6.1"
    browserslist "^4.6.4"
    caniuse-lite "^1.0.30000981"
    css-blank-pseudo "^0.1.4"
    css-has-pseudo "^0.10.0"
    css-prefers-color-scheme "^3.1.1"
    cssdb "^4.4.0"
    postcss "^7.0.17"
    postcss-attribute-case-insensitive "^4.0.1"
    postcss-color-functional-notation "^2.0.1"
    postcss-color-gray "^5.0.0"
    postcss-color-hex-alpha "^5.0.3"
    postcss-color-mod-function "^3.0.3"
    postcss-color-rebeccapurple "^4.0.1"
    postcss-custom-media "^7.0.8"
    postcss-custom-properties "^8.0.11"
    postcss-custom-selectors "^5.1.2"
    postcss-dir-pseudo-class "^5.0.0"
    postcss-double-position-gradients "^1.0.0"
    postcss-env-function "^2.0.2"
    postcss-focus-visible "^4.0.0"
    postcss-focus-within "^3.0.0"
    postcss-font-variant "^4.0.0"
    postcss-gap-properties "^2.0.0"
    postcss-image-set-function "^3.0.1"
    postcss-initial "^3.0.0"
    postcss-lab-function "^2.0.1"
    postcss-logical "^3.0.0"
    postcss-media-minmax "^4.0.0"
    postcss-nesting "^7.0.0"
    postcss-overflow-shorthand "^2.0.0"
    postcss-page-break "^2.0.0"
    postcss-place "^4.0.1"
    postcss-pseudo-class-any-link "^6.0.0"
    postcss-replace-overflow-wrap "^3.0.0"
    postcss-selector-matches "^4.0.0"
    postcss-selector-not "^4.0.0"

postcss-pseudo-class-any-link@^6.0.0:
  version "6.0.0"
  resolved "https://registry.yarnpkg.com/postcss-pseudo-class-any-link/-/postcss-pseudo-class-any-link-6.0.0.tgz#2ed3eed393b3702879dec4a87032b210daeb04d1"
  integrity sha512-lgXW9sYJdLqtmw23otOzrtbDXofUdfYzNm4PIpNE322/swES3VU9XlXHeJS46zT2onFO7V1QFdD4Q9LiZj8mew==
  dependencies:
    postcss "^7.0.2"
    postcss-selector-parser "^5.0.0-rc.3"

postcss-reduce-initial@^4.0.3:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/postcss-reduce-initial/-/postcss-reduce-initial-4.0.3.tgz#7fd42ebea5e9c814609639e2c2e84ae270ba48df"
  integrity sha512-gKWmR5aUulSjbzOfD9AlJiHCGH6AEVLaM0AV+aSioxUDd16qXP1PCh8d1/BGVvpdWn8k/HiK7n6TjeoXN1F7DA==
  dependencies:
    browserslist "^4.0.0"
    caniuse-api "^3.0.0"
    has "^1.0.0"
    postcss "^7.0.0"

postcss-reduce-transforms@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-reduce-transforms/-/postcss-reduce-transforms-4.0.2.tgz#17efa405eacc6e07be3414a5ca2d1074681d4e29"
  integrity sha512-EEVig1Q2QJ4ELpJXMZR8Vt5DQx8/mo+dGWSR7vWXqcob2gQLyQGsionYcGKATXvQzMPn6DSN1vTN7yFximdIAg==
  dependencies:
    cssnano-util-get-match "^4.0.0"
    has "^1.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"

postcss-replace-overflow-wrap@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/postcss-replace-overflow-wrap/-/postcss-replace-overflow-wrap-3.0.0.tgz#61b360ffdaedca84c7c918d2b0f0d0ea559ab01c"
  integrity sha512-2T5hcEHArDT6X9+9dVSPQdo7QHzG4XKclFT8rU5TzJPDN7RIRTbO9c4drUISOVemLj03aezStHCR2AIcr8XLpw==
  dependencies:
    postcss "^7.0.2"

postcss-safe-parser@4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-safe-parser/-/postcss-safe-parser-4.0.1.tgz#8756d9e4c36fdce2c72b091bbc8ca176ab1fcdea"
  integrity sha512-xZsFA3uX8MO3yAda03QrG3/Eg1LN3EPfjjf07vke/46HERLZyHrTsQ9E1r1w1W//fWEhtYNndo2hQplN2cVpCQ==
  dependencies:
    postcss "^7.0.0"

postcss-selector-matches@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/postcss-selector-matches/-/postcss-selector-matches-4.0.0.tgz#71c8248f917ba2cc93037c9637ee09c64436fcff"
  integrity sha512-LgsHwQR/EsRYSqlwdGzeaPKVT0Ml7LAT6E75T8W8xLJY62CE4S/l03BWIt3jT8Taq22kXP08s2SfTSzaraoPww==
  dependencies:
    balanced-match "^1.0.0"
    postcss "^7.0.2"

postcss-selector-not@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/postcss-selector-not/-/postcss-selector-not-4.0.0.tgz#c68ff7ba96527499e832724a2674d65603b645c0"
  integrity sha512-W+bkBZRhqJaYN8XAnbbZPLWMvZD1wKTu0UxtFKdhtGjWYmxhkUneoeOhRJKdAE5V7ZTlnbHfCR+6bNwK9e1dTQ==
  dependencies:
    balanced-match "^1.0.0"
    postcss "^7.0.2"

postcss-selector-parser@^3.0.0:
  version "3.1.2"
  resolved "https://registry.yarnpkg.com/postcss-selector-parser/-/postcss-selector-parser-3.1.2.tgz#b310f5c4c0fdaf76f94902bbaa30db6aa84f5270"
  integrity sha512-h7fJ/5uWuRVyOtkO45pnt1Ih40CEleeyCHzipqAZO2e5H20g25Y48uYnFUiShvY4rZWNJ/Bib/KVPmanaCtOhA==
  dependencies:
    dot-prop "^5.2.0"
    indexes-of "^1.0.1"
    uniq "^1.0.1"

postcss-selector-parser@^5.0.0-rc.3, postcss-selector-parser@^5.0.0-rc.4:
  version "5.0.0"
  resolved "https://registry.yarnpkg.com/postcss-selector-parser/-/postcss-selector-parser-5.0.0.tgz#249044356697b33b64f1a8f7c80922dddee7195c"
  integrity sha512-w+zLE5Jhg6Liz8+rQOWEAwtwkyqpfnmsinXjXg6cY7YIONZZtgvE0v2O0uhQBs0peNomOJwWRKt6JBfTdTd3OQ==
  dependencies:
    cssesc "^2.0.0"
    indexes-of "^1.0.1"
    uniq "^1.0.1"

postcss-selector-parser@^6.0.0, postcss-selector-parser@^6.0.2:
  version "6.0.2"
  resolved "https://registry.yarnpkg.com/postcss-selector-parser/-/postcss-selector-parser-6.0.2.tgz#934cf799d016c83411859e09dcecade01286ec5c"
  integrity sha512-36P2QR59jDTOAiIkqEprfJDsoNrvwFei3eCqKd1Y0tUsBimsq39BLp7RD+JWny3WgB1zGhJX8XVePwm9k4wdBg==
  dependencies:
    cssesc "^3.0.0"
    indexes-of "^1.0.1"
    uniq "^1.0.1"

postcss-svgo@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/postcss-svgo/-/postcss-svgo-4.0.2.tgz#17b997bc711b333bab143aaed3b8d3d6e3d38258"
  integrity sha512-C6wyjo3VwFm0QgBy+Fu7gCYOkCmgmClghO+pjcxvrcBKtiKt0uCF+hvbMO1fyv5BMImRK90SMb+dwUnfbGd+jw==
  dependencies:
    is-svg "^3.0.0"
    postcss "^7.0.0"
    postcss-value-parser "^3.0.0"
    svgo "^1.0.0"

postcss-unique-selectors@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/postcss-unique-selectors/-/postcss-unique-selectors-4.0.1.tgz#9446911f3289bfd64c6d680f073c03b1f9ee4bac"
  integrity sha512-+JanVaryLo9QwZjKrmJgkI4Fn8SBgRO6WXQBJi7KiAVPlmxikB5Jzc4EvXMT2H0/m0RjrVVm9rGNhZddm/8Spg==
  dependencies:
    alphanum-sort "^1.0.0"
    postcss "^7.0.0"
    uniqs "^2.0.0"

postcss-value-parser@^3.0.0:
  version "3.3.1"
  resolved "https://registry.yarnpkg.com/postcss-value-parser/-/postcss-value-parser-3.3.1.tgz#9ff822547e2893213cf1c30efa51ac5fd1ba8281"
  integrity sha512-pISE66AbVkp4fDQ7VHBwRNXzAAKJjw4Vw7nWI/+Q3vuly7SNfgYXvm6i5IgFylHGK5sP/xHAbB7N49OS4gWNyQ==

postcss-value-parser@^4.0.0, postcss-value-parser@^4.0.2:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/postcss-value-parser/-/postcss-value-parser-4.0.3.tgz#651ff4593aa9eda8d5d0d66593a2417aeaeb325d"
  integrity sha512-N7h4pG+Nnu5BEIzyeaaIYWs0LI5XC40OrRh5L60z0QjFsqGWcHcbkBvpe1WYpcIS9yQ8sOi/vIPt1ejQCrMVrg==

postcss-values-parser@^2.0.0, postcss-values-parser@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/postcss-values-parser/-/postcss-values-parser-2.0.1.tgz#da8b472d901da1e205b47bdc98637b9e9e550e5f"
  integrity sha512-2tLuBsA6P4rYTNKCXYG/71C7j1pU6pK503suYOmn4xYrQIzW+opD+7FAFNuGSdZC/3Qfy334QbeMu7MEb8gOxg==
  dependencies:
    flatten "^1.0.2"
    indexes-of "^1.0.1"
    uniq "^1.0.1"

postcss@7.0.21:
  version "7.0.21"
  resolved "https://registry.yarnpkg.com/postcss/-/postcss-7.0.21.tgz#06bb07824c19c2021c5d056d5b10c35b989f7e17"
  integrity sha512-uIFtJElxJo29QC753JzhidoAhvp/e/Exezkdhfmt8AymWT6/5B7W1WmponYWkHk2eg6sONyTch0A3nkMPun3SQ==
  dependencies:
    chalk "^2.4.2"
    source-map "^0.6.1"
    supports-color "^6.1.0"

postcss@^7, postcss@^7.0.0, postcss@^7.0.1, postcss@^7.0.14, postcss@^7.0.16, postcss@^7.0.17, postcss@^7.0.2, postcss@^7.0.23, postcss@^7.0.26, postcss@^7.0.27, postcss@^7.0.5, postcss@^7.0.6:
  version "7.0.27"
  resolved "https://registry.yarnpkg.com/postcss/-/postcss-7.0.27.tgz#cc67cdc6b0daa375105b7c424a85567345fc54d9"
  integrity sha512-WuQETPMcW9Uf1/22HWUWP9lgsIC+KEHg2kozMflKjbeUtw9ujvFX6QmIfozaErDkmLWS9WEnEdEe6Uo9/BNTdQ==
  dependencies:
    chalk "^2.4.2"
    source-map "^0.6.1"
    supports-color "^6.1.0"

prelude-ls@~1.1.2:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/prelude-ls/-/prelude-ls-1.1.2.tgz#21932a549f5e52ffd9a827f570e04be62a97da54"
  integrity sha1-IZMqVJ9eUv/ZqCf1cOBL5iqX2lQ=

prepend-http@^1.0.0:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/prepend-http/-/prepend-http-1.0.4.tgz#d4f4562b0ce3696e41ac52d0e002e57a635dc6dc"
  integrity sha1-1PRWKwzjaW5BrFLQ4ALlemNdxtw=

pretty-bytes@^5.1.0:
  version "5.3.0"
  resolved "https://registry.yarnpkg.com/pretty-bytes/-/pretty-bytes-5.3.0.tgz#f2849e27db79fb4d6cfe24764fc4134f165989f2"
  integrity sha512-hjGrh+P926p4R4WbaB6OckyRtO0F0/lQBiT+0gnxjV+5kjPBrfVBFCsCLbMqVQeydvIoouYTCmmEURiH3R1Bdg==

pretty-error@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/pretty-error/-/pretty-error-2.1.1.tgz#5f4f87c8f91e5ae3f3ba87ab4cf5e03b1a17f1a3"
  integrity sha1-X0+HyPkeWuPzuoerTPXgOxoX8aM=
  dependencies:
    renderkid "^2.0.1"
    utila "~0.4"

pretty-format@^24.0.0, pretty-format@^24.3.0, pretty-format@^24.9.0:
  version "24.9.0"
  resolved "https://registry.yarnpkg.com/pretty-format/-/pretty-format-24.9.0.tgz#12fac31b37019a4eea3c11aa9a959eb7628aa7c9"
  integrity sha512-00ZMZUiHaJrNfk33guavqgvfJS30sLYf0f8+Srklv0AMPodGGHcoHgksZ3OThYnIvOd+8yMCn0YiEOogjlgsnA==
  dependencies:
    "@jest/types" "^24.9.0"
    ansi-regex "^4.0.0"
    ansi-styles "^3.2.0"
    react-is "^16.8.4"

pretty-format@^25.1.0:
  version "25.4.0"
  resolved "https://registry.yarnpkg.com/pretty-format/-/pretty-format-25.4.0.tgz#c58801bb5c4926ff4a677fe43f9b8b99812c7830"
  integrity sha512-PI/2dpGjXK5HyXexLPZU/jw5T9Q6S1YVXxxVxco+LIqzUFHXIbKZKdUVt7GcX7QUCr31+3fzhi4gN4/wUYPVxQ==
  dependencies:
    "@jest/types" "^25.4.0"
    ansi-regex "^5.0.0"
    ansi-styles "^4.0.0"
    react-is "^16.12.0"

private@^0.1.8:
  version "0.1.8"
  resolved "https://registry.yarnpkg.com/private/-/private-0.1.8.tgz#2381edb3689f7a53d653190060fcf822d2f368ff"
  integrity sha512-VvivMrbvd2nKkiG38qjULzlc+4Vx4wm/whI9pQD35YrARNnhxeiRktSOhSukRLFNlzg6Br/cJPet5J/u19r/mg==

process-nextick-args@~2.0.0:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/process-nextick-args/-/process-nextick-args-2.0.1.tgz#7820d9b16120cc55ca9ae7792680ae7dba6d7fe2"
  integrity sha512-3ouUOpQhtgrbOa17J7+uxOTpITYWaGP7/AhoR3+A+/1e9skrzelGi/dXzEYyvbxubEF6Wn2ypscTKiKJFFn1ag==

process@^0.11.10:
  version "0.11.10"
  resolved "https://registry.yarnpkg.com/process/-/process-0.11.10.tgz#7332300e840161bda3e69a1d1d91a7d4bc16f182"
  integrity sha1-czIwDoQBYb2j5podHZGn1LwW8YI=

progress@^2.0.0:
  version "2.0.3"
  resolved "https://registry.yarnpkg.com/progress/-/progress-2.0.3.tgz#7e8cf8d8f5b8f239c1bc68beb4eb78567d572ef8"
  integrity sha512-7PiHtLll5LdnKIMw100I+8xJXR5gW2QwWYkT6iJva0bXitZKa/XMrSbdmg3r2Xnaidz9Qumd0VPaMrZlF9V9sA==

promise-inflight@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/promise-inflight/-/promise-inflight-1.0.1.tgz#98472870bf228132fcbdd868129bad12c3c029e3"
  integrity sha1-mEcocL8igTL8vdhoEputEsPAKeM=

promise@^8.0.3:
  version "8.1.0"
  resolved "https://registry.yarnpkg.com/promise/-/promise-8.1.0.tgz#697c25c3dfe7435dd79fcd58c38a135888eaf05e"
  integrity sha512-W04AqnILOL/sPRXziNicCjSNRruLAuIHEOVBazepu0545DDNGYHz7ar9ZgZ1fMU8/MA4mVxp5rkBWRi6OXIy3Q==
  dependencies:
    asap "~2.0.6"

prompts@^2.0.1:
  version "2.3.2"
  resolved "https://registry.yarnpkg.com/prompts/-/prompts-2.3.2.tgz#480572d89ecf39566d2bd3fe2c9fccb7c4c0b068"
  integrity sha512-Q06uKs2CkNYVID0VqwfAl9mipo99zkBv/n2JtWY89Yxa3ZabWSrs0e2KTudKVa3peLUvYXMefDqIleLPVUBZMA==
  dependencies:
    kleur "^3.0.3"
    sisteransi "^1.0.4"

prop-types@^15.6.2, prop-types@^15.7.2:
  version "15.7.2"
  resolved "https://registry.yarnpkg.com/prop-types/-/prop-types-15.7.2.tgz#52c41e75b8c87e72b9d9360e0206b99dcbffa6c5"
  integrity sha512-8QQikdH7//R2vurIJSutZ1smHYTcLpRWEOlHnzcWHmBYrOGUysKwSsrC89BCiFj3CbrfJ/nXFdJepOVrY1GCHQ==
  dependencies:
    loose-envify "^1.4.0"
    object-assign "^4.1.1"
    react-is "^16.8.1"

proxy-addr@~2.0.5:
  version "2.0.6"
  resolved "https://registry.yarnpkg.com/proxy-addr/-/proxy-addr-2.0.6.tgz#fdc2336505447d3f2f2c638ed272caf614bbb2bf"
  integrity sha512-dh/frvCBVmSsDYzw6n926jv974gddhkFPfiN8hPOi30Wax25QZyZEGveluCgliBnqmuM+UJmBErbAUFIoDbjOw==
  dependencies:
    forwarded "~0.1.2"
    ipaddr.js "1.9.1"

prr@~1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/prr/-/prr-1.0.1.tgz#d3fc114ba06995a45ec6893f484ceb1d78f5f476"
  integrity sha1-0/wRS6BplaRexok/SEzrHXj19HY=

psl@^1.1.28:
  version "1.7.0"
  resolved "https://registry.yarnpkg.com/psl/-/psl-1.7.0.tgz#f1c4c47a8ef97167dea5d6bbf4816d736e884a3c"
  integrity sha512-5NsSEDv8zY70ScRnOTn7bK7eanl2MvFrOrS/R6x+dBt5g1ghnj9Zv90kO8GwT8gxcu2ANyFprnFYB85IogIJOQ==

public-encrypt@^4.0.0:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/public-encrypt/-/public-encrypt-4.0.3.tgz#4fcc9d77a07e48ba7527e7cbe0de33d0701331e0"
  integrity sha512-zVpa8oKZSz5bTMTFClc1fQOnyyEzpl5ozpi1B5YcvBrdohMjH2rfsBtyXcuNuwjsDIXmBYlF2N5FlJYhR29t8Q==
  dependencies:
    bn.js "^4.1.0"
    browserify-rsa "^4.0.0"
    create-hash "^1.1.0"
    parse-asn1 "^5.0.0"
    randombytes "^2.0.1"
    safe-buffer "^5.1.2"

pump@^2.0.0:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/pump/-/pump-2.0.1.tgz#12399add6e4cf7526d973cbc8b5ce2e2908b3909"
  integrity sha512-ruPMNRkN3MHP1cWJc9OWr+T/xDP0jhXYCLfJcBuX54hhfIBnaQmAUMfDcG4DM5UMWByBbJY69QSphm3jtDKIkA==
  dependencies:
    end-of-stream "^1.1.0"
    once "^1.3.1"

pump@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/pump/-/pump-3.0.0.tgz#b4a2116815bde2f4e1ea602354e8c75565107a64"
  integrity sha512-LwZy+p3SFs1Pytd/jYct4wpv49HiYCqd9Rlc5ZVdk0V+8Yzv6jR5Blk3TRmPL1ft69TxP0IMZGJ+WPFU2BFhww==
  dependencies:
    end-of-stream "^1.1.0"
    once "^1.3.1"

pumpify@^1.3.3:
  version "1.5.1"
  resolved "https://registry.yarnpkg.com/pumpify/-/pumpify-1.5.1.tgz#36513be246ab27570b1a374a5ce278bfd74370ce"
  integrity sha512-oClZI37HvuUJJxSKKrC17bZ9Cu0ZYhEAGPsPUy9KlMUmv9dKX2o77RUmq7f3XjIxbwyGwYzbzQ1L2Ks8sIradQ==
  dependencies:
    duplexify "^3.6.0"
    inherits "^2.0.3"
    pump "^2.0.0"

punycode@1.3.2:
  version "1.3.2"
  resolved "https://registry.yarnpkg.com/punycode/-/punycode-1.3.2.tgz#9653a036fb7c1ee42342f2325cceefea3926c48d"
  integrity sha1-llOgNvt8HuQjQvIyXM7v6jkmxI0=

punycode@^1.2.4:
  version "1.4.1"
  resolved "https://registry.yarnpkg.com/punycode/-/punycode-1.4.1.tgz#c0d5a63b2718800ad8e1eb0fa5269c84dd41845e"
  integrity sha1-wNWmOycYgArY4esPpSachN1BhF4=

punycode@^2.1.0, punycode@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/punycode/-/punycode-2.1.1.tgz#b58b010ac40c22c5657616c8d2c2c02c7bf479ec"
  integrity sha512-XRsRjdf+j5ml+y/6GKHPZbrF/8p2Yga0JPtdqTIY2Xe5ohJPD9saDJJLPvp9+NSBprVvevdXZybnj2cv8OEd0A==

q@^1.1.2:
  version "1.5.1"
  resolved "https://registry.yarnpkg.com/q/-/q-1.5.1.tgz#7e32f75b41381291d04611f1bf14109ac00651d7"
  integrity sha1-fjL3W0E4EpHQRhHxvxQQmsAGUdc=

qs@6.7.0:
  version "6.7.0"
  resolved "https://registry.yarnpkg.com/qs/-/qs-6.7.0.tgz#41dc1a015e3d581f1621776be31afb2876a9b1bc"
  integrity sha512-VCdBRNFTX1fyE7Nb6FYoURo/SPe62QCaAyzJvUjwRaIsc+NePBEniHlvxFmmX56+HZphIGtV0XeCirBtpDrTyQ==

qs@~6.5.2:
  version "6.5.2"
  resolved "https://registry.yarnpkg.com/qs/-/qs-6.5.2.tgz#cb3ae806e8740444584ef154ce8ee98d403f3e36"
  integrity sha512-N5ZAX4/LxJmF+7wN74pUD6qAh9/wnvdQcjq9TZjevvXzSUo7bfmw91saqMjzGS2xq91/odN2dW/WOl7qQHNDGA==

query-string@^4.1.0:
  version "4.3.4"
  resolved "https://registry.yarnpkg.com/query-string/-/query-string-4.3.4.tgz#bbb693b9ca915c232515b228b1a02b609043dbeb"
  integrity sha1-u7aTucqRXCMlFbIosaArYJBD2+s=
  dependencies:
    object-assign "^4.1.0"
    strict-uri-encode "^1.0.0"

querystring-es3@^0.2.0:
  version "0.2.1"
  resolved "https://registry.yarnpkg.com/querystring-es3/-/querystring-es3-0.2.1.tgz#9ec61f79049875707d69414596fd907a4d711e73"
  integrity sha1-nsYfeQSYdXB9aUFFlv2Qek1xHnM=

querystring@0.2.0:
  version "0.2.0"
  resolved "https://registry.yarnpkg.com/querystring/-/querystring-0.2.0.tgz#b209849203bb25df820da756e747005878521620"
  integrity sha1-sgmEkgO7Jd+CDadW50cAWHhSFiA=

querystringify@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/querystringify/-/querystringify-2.1.1.tgz#60e5a5fd64a7f8bfa4d2ab2ed6fdf4c85bad154e"
  integrity sha512-w7fLxIRCRT7U8Qu53jQnJyPkYZIaR4n5151KMfcJlO/A9397Wxb1amJvROTK6TOnp7PfoAmg/qXiNHI+08jRfA==

raf@^3.4.1:
  version "3.4.1"
  resolved "https://registry.yarnpkg.com/raf/-/raf-3.4.1.tgz#0742e99a4a6552f445d73e3ee0328af0ff1ede39"
  integrity sha512-Sq4CW4QhwOHE8ucn6J34MqtZCeWFP2aQSmrlroYgqAV1PjStIhJXxYuTgUIfkEk7zTLjmIjLmU5q+fbD1NnOJA==
  dependencies:
    performance-now "^2.1.0"

randombytes@^2.0.0, randombytes@^2.0.1, randombytes@^2.0.5:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/randombytes/-/randombytes-2.1.0.tgz#df6f84372f0270dc65cdf6291349ab7a473d4f2a"
  integrity sha512-vYl3iOX+4CKUWuxGi9Ukhie6fsqXqS9FE2Zaic4tNFD2N2QQaXOMFbuKK4QmDHC0JO6B1Zp41J0LpT0oR68amQ==
  dependencies:
    safe-buffer "^5.1.0"

randomfill@^1.0.3:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/randomfill/-/randomfill-1.0.4.tgz#c92196fc86ab42be983f1bf31778224931d61458"
  integrity sha512-87lcbR8+MhcWcUiQ+9e+Rwx8MyR2P7qnt15ynUlbm3TU/fjbgz4GsvfSUDTemtCCtVCqb4ZcEFlyPNTh9bBTLw==
  dependencies:
    randombytes "^2.0.5"
    safe-buffer "^5.1.0"

range-parser@^1.2.1, range-parser@~1.2.1:
  version "1.2.1"
  resolved "https://registry.yarnpkg.com/range-parser/-/range-parser-1.2.1.tgz#3cf37023d199e1c24d1a55b84800c2f3e6468031"
  integrity sha512-Hrgsx+orqoygnmhFbKaHE6c296J+HTAQXoxEF6gNupROmmGJRoyzfG3ccAveqCBrwr/2yxQ5BVd/GTl5agOwSg==

raw-body@2.4.0:
  version "2.4.0"
  resolved "https://registry.yarnpkg.com/raw-body/-/raw-body-2.4.0.tgz#a1ce6fb9c9bc356ca52e89256ab59059e13d0332"
  integrity sha512-4Oz8DUIwdvoa5qMJelxipzi/iJIi40O5cGV1wNYp5hvZP8ZN0T+jiNkL0QepXs+EsQ9XJ8ipEDoiH70ySUJP3Q==
  dependencies:
    bytes "3.1.0"
    http-errors "1.7.2"
    iconv-lite "0.4.24"
    unpipe "1.0.0"

react-app-polyfill@^1.0.6:
  version "1.0.6"
  resolved "https://registry.yarnpkg.com/react-app-polyfill/-/react-app-polyfill-1.0.6.tgz#890f8d7f2842ce6073f030b117de9130a5f385f0"
  integrity sha512-OfBnObtnGgLGfweORmdZbyEz+3dgVePQBb3zipiaDsMHV1NpWm0rDFYIVXFV/AK+x4VIIfWHhrdMIeoTLyRr2g==
  dependencies:
    core-js "^3.5.0"
    object-assign "^4.1.1"
    promise "^8.0.3"
    raf "^3.4.1"
    regenerator-runtime "^0.13.3"
    whatwg-fetch "^3.0.0"

react-dev-utils@^10.2.1:
  version "10.2.1"
  resolved "https://registry.yarnpkg.com/react-dev-utils/-/react-dev-utils-10.2.1.tgz#f6de325ae25fa4d546d09df4bb1befdc6dd19c19"
  integrity sha512-XxTbgJnYZmxuPtY3y/UV0D8/65NKkmaia4rXzViknVnZeVlklSh8u6TnaEYPfAi/Gh1TP4mEOXHI6jQOPbeakQ==
  dependencies:
    "@babel/code-frame" "7.8.3"
    address "1.1.2"
    browserslist "4.10.0"
    chalk "2.4.2"
    cross-spawn "7.0.1"
    detect-port-alt "1.1.6"
    escape-string-regexp "2.0.0"
    filesize "6.0.1"
    find-up "4.1.0"
    fork-ts-checker-webpack-plugin "3.1.1"
    global-modules "2.0.0"
    globby "8.0.2"
    gzip-size "5.1.1"
    immer "1.10.0"
    inquirer "7.0.4"
    is-root "2.1.0"
    loader-utils "1.2.3"
    open "^7.0.2"
    pkg-up "3.1.0"
    react-error-overlay "^6.0.7"
    recursive-readdir "2.2.2"
    shell-quote "1.7.2"
    strip-ansi "6.0.0"
    text-table "0.2.0"

react-dom@^16.13.1:
  version "16.13.1"
  resolved "https://registry.yarnpkg.com/react-dom/-/react-dom-16.13.1.tgz#c1bd37331a0486c078ee54c4740720993b2e0e7f"
  integrity sha512-81PIMmVLnCNLO/fFOQxdQkvEq/+Hfpv24XNJfpyZhTRfO0QcmQIF/PgCa1zCOj2w1hrn12MFLyaJ/G0+Mxtfag==
  dependencies:
    loose-envify "^1.1.0"
    object-assign "^4.1.1"
    prop-types "^15.6.2"
    scheduler "^0.19.1"

react-error-overlay@^6.0.7:
  version "6.0.7"
  resolved "https://registry.yarnpkg.com/react-error-overlay/-/react-error-overlay-6.0.7.tgz#1dcfb459ab671d53f660a991513cb2f0a0553108"
  integrity sha512-TAv1KJFh3RhqxNvhzxj6LeT5NWklP6rDr2a0jaTfsZ5wSZWHOGeqQyejUp3xxLfPt2UpyJEcVQB/zyPcmonNFA==

react-is@^16.12.0, react-is@^16.8.1, react-is@^16.8.4:
  version "16.13.1"
  resolved "https://registry.yarnpkg.com/react-is/-/react-is-16.13.1.tgz#789729a4dc36de2999dc156dd6c1d9c18cea56a4"
  integrity sha512-24e6ynE2H+OKt4kqsOvNd8kBpV65zoxbA4BVsEOB3ARVWQki/DHzaUoC5KuON/BiccDaCCTZBuOcfZs70kR8bQ==

react-scripts@3.4.1:
  version "3.4.1"
  resolved "https://registry.yarnpkg.com/react-scripts/-/react-scripts-3.4.1.tgz#f551298b5c71985cc491b9acf3c8e8c0ae3ada0a"
  integrity sha512-JpTdi/0Sfd31mZA6Ukx+lq5j1JoKItX7qqEK4OiACjVQletM1P38g49d9/D0yTxp9FrSF+xpJFStkGgKEIRjlQ==
  dependencies:
    "@babel/core" "7.9.0"
    "@svgr/webpack" "4.3.3"
    "@typescript-eslint/eslint-plugin" "^2.10.0"
    "@typescript-eslint/parser" "^2.10.0"
    babel-eslint "10.1.0"
    babel-jest "^24.9.0"
    babel-loader "8.1.0"
    babel-plugin-named-asset-import "^0.3.6"
    babel-preset-react-app "^9.1.2"
    camelcase "^5.3.1"
    case-sensitive-paths-webpack-plugin "2.3.0"
    css-loader "3.4.2"
    dotenv "8.2.0"
    dotenv-expand "5.1.0"
    eslint "^6.6.0"
    eslint-config-react-app "^5.2.1"
    eslint-loader "3.0.3"
    eslint-plugin-flowtype "4.6.0"
    eslint-plugin-import "2.20.1"
    eslint-plugin-jsx-a11y "6.2.3"
    eslint-plugin-react "7.19.0"
    eslint-plugin-react-hooks "^1.6.1"
    file-loader "4.3.0"
    fs-extra "^8.1.0"
    html-webpack-plugin "4.0.0-beta.11"
    identity-obj-proxy "3.0.0"
    jest "24.9.0"
    jest-environment-jsdom-fourteen "1.0.1"
    jest-resolve "24.9.0"
    jest-watch-typeahead "0.4.2"
    mini-css-extract-plugin "0.9.0"
    optimize-css-assets-webpack-plugin "5.0.3"
    pnp-webpack-plugin "1.6.4"
    postcss-flexbugs-fixes "4.1.0"
    postcss-loader "3.0.0"
    postcss-normalize "8.0.1"
    postcss-preset-env "6.7.0"
    postcss-safe-parser "4.0.1"
    react-app-polyfill "^1.0.6"
    react-dev-utils "^10.2.1"
    resolve "1.15.0"
    resolve-url-loader "3.1.1"
    sass-loader "8.0.2"
    semver "6.3.0"
    style-loader "0.23.1"
    terser-webpack-plugin "2.3.5"
    ts-pnp "1.1.6"
    url-loader "2.3.0"
    webpack "4.42.0"
    webpack-dev-server "3.10.3"
    webpack-manifest-plugin "2.2.0"
    workbox-webpack-plugin "4.3.1"
  optionalDependencies:
    fsevents "2.1.2"

react@^16.13.1:
  version "16.13.1"
  resolved "https://registry.yarnpkg.com/react/-/react-16.13.1.tgz#2e818822f1a9743122c063d6410d85c1e3afe48e"
  integrity sha512-YMZQQq32xHLX0bz5Mnibv1/LHb3Sqzngu7xstSM+vrkE5Kzr9xE0yMByK5kMoTK30YVJE61WfbxIFFvfeDKT1w==
  dependencies:
    loose-envify "^1.1.0"
    object-assign "^4.1.1"
    prop-types "^15.6.2"

read-pkg-up@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/read-pkg-up/-/read-pkg-up-2.0.0.tgz#6b72a8048984e0c41e79510fd5e9fa99b3b549be"
  integrity sha1-a3KoBImE4MQeeVEP1en6mbO1Sb4=
  dependencies:
    find-up "^2.0.0"
    read-pkg "^2.0.0"

read-pkg-up@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/read-pkg-up/-/read-pkg-up-4.0.0.tgz#1b221c6088ba7799601c808f91161c66e58f8978"
  integrity sha512-6etQSH7nJGsK0RbG/2TeDzZFa8shjQ1um+SwQQ5cwKy0dhSXdOncEhb1CPpvQG4h7FyOV6EB6YlV0yJvZQNAkA==
  dependencies:
    find-up "^3.0.0"
    read-pkg "^3.0.0"

read-pkg@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/read-pkg/-/read-pkg-2.0.0.tgz#8ef1c0623c6a6db0dc6713c4bfac46332b2368f8"
  integrity sha1-jvHAYjxqbbDcZxPEv6xGMysjaPg=
  dependencies:
    load-json-file "^2.0.0"
    normalize-package-data "^2.3.2"
    path-type "^2.0.0"

read-pkg@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/read-pkg/-/read-pkg-3.0.0.tgz#9cbc686978fee65d16c00e2b19c237fcf6e38389"
  integrity sha1-nLxoaXj+5l0WwA4rGcI3/Pbjg4k=
  dependencies:
    load-json-file "^4.0.0"
    normalize-package-data "^2.3.2"
    path-type "^3.0.0"

"readable-stream@1 || 2", readable-stream@^2.0.0, readable-stream@^2.0.1, readable-stream@^2.0.2, readable-stream@^2.1.5, readable-stream@^2.2.2, readable-stream@^2.3.3, readable-stream@^2.3.6, readable-stream@~2.3.6:
  version "2.3.7"
  resolved "https://registry.yarnpkg.com/readable-stream/-/readable-stream-2.3.7.tgz#1eca1cf711aef814c04f62252a36a62f6cb23b57"
  integrity sha512-Ebho8K4jIbHAxnuxi7o42OrZgF/ZTNcsZj6nRKyUmkhLFq8CHItp/fy6hQZuZmP/n3yZ9VBUbp4zz/mX8hmYPw==
  dependencies:
    core-util-is "~1.0.0"
    inherits "~2.0.3"
    isarray "~1.0.0"
    process-nextick-args "~2.0.0"
    safe-buffer "~5.1.1"
    string_decoder "~1.1.1"
    util-deprecate "~1.0.1"

readable-stream@^3.0.6, readable-stream@^3.1.1:
  version "3.6.0"
  resolved "https://registry.yarnpkg.com/readable-stream/-/readable-stream-3.6.0.tgz#337bbda3adc0706bd3e024426a286d4b4b2c9198"
  integrity sha512-BViHy7LKeTz4oNnkcLJ+lVSL6vpiFeX6/d3oSH8zCW7UxP2onchk+vTGB143xuFjHS3deTgkKoXXymXqymiIdA==
  dependencies:
    inherits "^2.0.3"
    string_decoder "^1.1.1"
    util-deprecate "^1.0.1"

readdirp@^2.2.1:
  version "2.2.1"
  resolved "https://registry.yarnpkg.com/readdirp/-/readdirp-2.2.1.tgz#0e87622a3325aa33e892285caf8b4e846529a525"
  integrity sha512-1JU/8q+VgFZyxwrJ+SVIOsh+KywWGpds3NTqikiKpDMZWScmAYyKIgqkO+ARvNWJfXeXR1zxz7aHF4u4CyH6vQ==
  dependencies:
    graceful-fs "^4.1.11"
    micromatch "^3.1.10"
    readable-stream "^2.0.2"

readdirp@~3.3.0:
  version "3.3.0"
  resolved "https://registry.yarnpkg.com/readdirp/-/readdirp-3.3.0.tgz#984458d13a1e42e2e9f5841b129e162f369aff17"
  integrity sha512-zz0pAkSPOXXm1viEwygWIPSPkcBYjW1xU5j/JBh5t9bGCJwa6f9+BJa6VaB2g+b55yVrmXzqkyLf4xaWYM0IkQ==
  dependencies:
    picomatch "^2.0.7"

realpath-native@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/realpath-native/-/realpath-native-1.1.0.tgz#2003294fea23fb0672f2476ebe22fcf498a2d65c"
  integrity sha512-wlgPA6cCIIg9gKz0fgAPjnzh4yR/LnXovwuo9hvyGvx3h8nX4+/iLZplfUWasXpqD8BdnGnP5njOFjkUwPzvjA==
  dependencies:
    util.promisify "^1.0.0"

recursive-readdir@2.2.2:
  version "2.2.2"
  resolved "https://registry.yarnpkg.com/recursive-readdir/-/recursive-readdir-2.2.2.tgz#9946fb3274e1628de6e36b2f6714953b4845094f"
  integrity sha512-nRCcW9Sj7NuZwa2XvH9co8NPeXUBhZP7CRKJtU+cS6PW9FpCIFoI5ib0NT1ZrbNuPoRy0ylyCaUL8Gih4LSyFg==
  dependencies:
    minimatch "3.0.4"

redent@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/redent/-/redent-3.0.0.tgz#e557b7998316bb53c9f1f56fa626352c6963059f"
  integrity sha512-6tDA8g98We0zd0GvVeMT9arEOnTw9qM03L9cJXaCjrip1OO764RDBLBfrB4cwzNGDj5OA5ioymC9GkizgWJDUg==
  dependencies:
    indent-string "^4.0.0"
    strip-indent "^3.0.0"

regenerate-unicode-properties@^8.2.0:
  version "8.2.0"
  resolved "https://registry.yarnpkg.com/regenerate-unicode-properties/-/regenerate-unicode-properties-8.2.0.tgz#e5de7111d655e7ba60c057dbe9ff37c87e65cdec"
  integrity sha512-F9DjY1vKLo/tPePDycuH3dn9H1OTPIkVD9Kz4LODu+F2C75mgjAJ7x/gwy6ZcSNRAAkhNlJSOHRe8k3p+K9WhA==
  dependencies:
    regenerate "^1.4.0"

regenerate@^1.4.0:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/regenerate/-/regenerate-1.4.0.tgz#4a856ec4b56e4077c557589cae85e7a4c8869a11"
  integrity sha512-1G6jJVDWrt0rK99kBjvEtziZNCICAuvIPkSiUFIQxVP06RCVpq3dmDo2oi6ABpYaDYaTRr67BEhL8r1wgEZZKg==

regenerator-runtime@^0.11.0:
  version "0.11.1"
  resolved "https://registry.yarnpkg.com/regenerator-runtime/-/regenerator-runtime-0.11.1.tgz#be05ad7f9bf7d22e056f9726cee5017fbf19e2e9"
  integrity sha512-MguG95oij0fC3QV3URf4V2SDYGJhJnJGqvIIgdECeODCT98wSWDAJ94SSuVpYQUoTcGUIL6L4yNB7j1DFFHSBg==

regenerator-runtime@^0.13.3, regenerator-runtime@^0.13.4:
  version "0.13.5"
  resolved "https://registry.yarnpkg.com/regenerator-runtime/-/regenerator-runtime-0.13.5.tgz#d878a1d094b4306d10b9096484b33ebd55e26697"
  integrity sha512-ZS5w8CpKFinUzOwW3c83oPeVXoNsrLsaCoLtJvAClH135j/R77RuymhiSErhm2lKcwSCIpmvIWSbDkIfAqKQlA==

regenerator-transform@^0.14.2:
  version "0.14.4"
  resolved "https://registry.yarnpkg.com/regenerator-transform/-/regenerator-transform-0.14.4.tgz#5266857896518d1616a78a0479337a30ea974cc7"
  integrity sha512-EaJaKPBI9GvKpvUz2mz4fhx7WPgvwRLY9v3hlNHWmAuJHI13T4nwKnNvm5RWJzEdnI5g5UwtOww+S8IdoUC2bw==
  dependencies:
    "@babel/runtime" "^7.8.4"
    private "^0.1.8"

regex-not@^1.0.0, regex-not@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/regex-not/-/regex-not-1.0.2.tgz#1f4ece27e00b0b65e0247a6810e6a85d83a5752c"
  integrity sha512-J6SDjUgDxQj5NusnOtdFxDwN/+HWykR8GELwctJ7mdqhcyy1xEc4SRFHUXvxTp661YaVKAjfRLZ9cCqS6tn32A==
  dependencies:
    extend-shallow "^3.0.2"
    safe-regex "^1.1.0"

regex-parser@2.2.10:
  version "2.2.10"
  resolved "https://registry.yarnpkg.com/regex-parser/-/regex-parser-2.2.10.tgz#9e66a8f73d89a107616e63b39d4deddfee912b37"
  integrity sha512-8t6074A68gHfU8Neftl0Le6KTDwfGAj7IyjPIMSfikI2wJUTHDMaIq42bUsfVnj8mhx0R+45rdUXHGpN164avA==

regexp.prototype.flags@^1.2.0, regexp.prototype.flags@^1.3.0:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/regexp.prototype.flags/-/regexp.prototype.flags-1.3.0.tgz#7aba89b3c13a64509dabcf3ca8d9fbb9bdf5cb75"
  integrity sha512-2+Q0C5g951OlYlJz6yu5/M33IcsESLlLfsyIaLJaG4FA2r4yP8MvVMJUUP/fVBkSpbbbZlS5gynbEWLipiiXiQ==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0-next.1"

regexpp@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/regexpp/-/regexpp-2.0.1.tgz#8d19d31cf632482b589049f8281f93dbcba4d07f"
  integrity sha512-lv0M6+TkDVniA3aD1Eg0DVpfU/booSu7Eev3TDO/mZKHBfVjgCGTV4t4buppESEYDtkArYFOxTJWv6S5C+iaNw==

regexpp@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/regexpp/-/regexpp-3.0.0.tgz#dd63982ee3300e67b41c1956f850aa680d9d330e"
  integrity sha512-Z+hNr7RAVWxznLPuA7DIh8UNX1j9CDrUQxskw9IrBE1Dxue2lyXT+shqEIeLUjrokxIP8CMy1WkjgG3rTsd5/g==

regexpu-core@^4.7.0:
  version "4.7.0"
  resolved "https://registry.yarnpkg.com/regexpu-core/-/regexpu-core-4.7.0.tgz#fcbf458c50431b0bb7b45d6967b8192d91f3d938"
  integrity sha512-TQ4KXRnIn6tz6tjnrXEkD/sshygKH/j5KzK86X8MkeHyZ8qst/LZ89j3X4/8HEIfHANTFIP/AbXakeRhWIl5YQ==
  dependencies:
    regenerate "^1.4.0"
    regenerate-unicode-properties "^8.2.0"
    regjsgen "^0.5.1"
    regjsparser "^0.6.4"
    unicode-match-property-ecmascript "^1.0.4"
    unicode-match-property-value-ecmascript "^1.2.0"

regjsgen@^0.5.1:
  version "0.5.1"
  resolved "https://registry.yarnpkg.com/regjsgen/-/regjsgen-0.5.1.tgz#48f0bf1a5ea205196929c0d9798b42d1ed98443c"
  integrity sha512-5qxzGZjDs9w4tzT3TPhCJqWdCc3RLYwy9J2NB0nm5Lz+S273lvWcpjaTGHsT1dc6Hhfq41uSEOw8wBmxrKOuyg==

regjsparser@^0.6.4:
  version "0.6.4"
  resolved "https://registry.yarnpkg.com/regjsparser/-/regjsparser-0.6.4.tgz#a769f8684308401a66e9b529d2436ff4d0666272"
  integrity sha512-64O87/dPDgfk8/RQqC4gkZoGyyWFIEUTTh80CU6CWuK5vkCGyekIx+oKcEIYtP/RAxSQltCZHCNu/mdd7fqlJw==
  dependencies:
    jsesc "~0.5.0"

relateurl@^0.2.7:
  version "0.2.7"
  resolved "https://registry.yarnpkg.com/relateurl/-/relateurl-0.2.7.tgz#54dbf377e51440aca90a4cd274600d3ff2d888a9"
  integrity sha1-VNvzd+UUQKypCkzSdGANP/LYiKk=

remove-trailing-separator@^1.0.1:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/remove-trailing-separator/-/remove-trailing-separator-1.1.0.tgz#c24bce2a283adad5bc3f58e0d48249b92379d8ef"
  integrity sha1-wkvOKig62tW8P1jg1IJJuSN52O8=

renderkid@^2.0.1:
  version "2.0.3"
  resolved "https://registry.yarnpkg.com/renderkid/-/renderkid-2.0.3.tgz#380179c2ff5ae1365c522bf2fcfcff01c5b74149"
  integrity sha512-z8CLQp7EZBPCwCnncgf9C4XAi3WR0dv+uWu/PjIyhhAb5d6IJ/QZqlHFprHeKT+59//V6BNUsLbvN8+2LarxGA==
  dependencies:
    css-select "^1.1.0"
    dom-converter "^0.2"
    htmlparser2 "^3.3.0"
    strip-ansi "^3.0.0"
    utila "^0.4.0"

repeat-element@^1.1.2:
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/repeat-element/-/repeat-element-1.1.3.tgz#782e0d825c0c5a3bb39731f84efee6b742e6b1ce"
  integrity sha512-ahGq0ZnV5m5XtZLMb+vP76kcAM5nkLqk0lpqAuojSKGgQtn4eRi4ZZGm2olo2zKFH+sMsWaqOCW1dqAnOru72g==

repeat-string@^1.6.1:
  version "1.6.1"
  resolved "https://registry.yarnpkg.com/repeat-string/-/repeat-string-1.6.1.tgz#8dcae470e1c88abc2d600fff4a776286da75e637"
  integrity sha1-jcrkcOHIirwtYA//Sndihtp15jc=

request-promise-core@1.1.3:
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/request-promise-core/-/request-promise-core-1.1.3.tgz#e9a3c081b51380dfea677336061fea879a829ee9"
  integrity sha512-QIs2+ArIGQVp5ZYbWD5ZLCY29D5CfWizP8eWnm8FoGD1TX61veauETVQbrV60662V0oFBkrDOuaBI8XgtuyYAQ==
  dependencies:
    lodash "^4.17.15"

request-promise-native@^1.0.5:
  version "1.0.8"
  resolved "https://registry.yarnpkg.com/request-promise-native/-/request-promise-native-1.0.8.tgz#a455b960b826e44e2bf8999af64dff2bfe58cb36"
  integrity sha512-dapwLGqkHtwL5AEbfenuzjTYg35Jd6KPytsC2/TLkVMz8rm+tNt72MGUWT1RP/aYawMpN6HqbNGBQaRcBtjQMQ==
  dependencies:
    request-promise-core "1.1.3"
    stealthy-require "^1.1.1"
    tough-cookie "^2.3.3"

request@^2.87.0, request@^2.88.0:
  version "2.88.2"
  resolved "https://registry.yarnpkg.com/request/-/request-2.88.2.tgz#d73c918731cb5a87da047e207234146f664d12b3"
  integrity sha512-MsvtOrfG9ZcrOwAW+Qi+F6HbD0CWXEh9ou77uOb7FM2WPhwT7smM833PzanhJLsgXjN89Ir6V2PczXNnMpwKhw==
  dependencies:
    aws-sign2 "~0.7.0"
    aws4 "^1.8.0"
    caseless "~0.12.0"
    combined-stream "~1.0.6"
    extend "~3.0.2"
    forever-agent "~0.6.1"
    form-data "~2.3.2"
    har-validator "~5.1.3"
    http-signature "~1.2.0"
    is-typedarray "~1.0.0"
    isstream "~0.1.2"
    json-stringify-safe "~5.0.1"
    mime-types "~2.1.19"
    oauth-sign "~0.9.0"
    performance-now "^2.1.0"
    qs "~6.5.2"
    safe-buffer "^5.1.2"
    tough-cookie "~2.5.0"
    tunnel-agent "^0.6.0"
    uuid "^3.3.2"

require-directory@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/require-directory/-/require-directory-2.1.1.tgz#8c64ad5fd30dab1c976e2344ffe7f792a6a6df42"
  integrity sha1-jGStX9MNqxyXbiNE/+f3kqam30I=

require-main-filename@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/require-main-filename/-/require-main-filename-1.0.1.tgz#97f717b69d48784f5f526a6c5aa8ffdda055a4d1"
  integrity sha1-l/cXtp1IeE9fUmpsWqj/3aBVpNE=

require-main-filename@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/require-main-filename/-/require-main-filename-2.0.0.tgz#d0b329ecc7cc0f61649f62215be69af54aa8989b"
  integrity sha512-NKN5kMDylKuldxYLSUfrbo5Tuzh4hd+2E8NPPX02mZtn1VuREQToYe/ZdlJy+J3uCpfaiGF05e7B8W0iXbQHmg==

requires-port@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/requires-port/-/requires-port-1.0.0.tgz#925d2601d39ac485e091cf0da5c6e694dc3dcaff"
  integrity sha1-kl0mAdOaxIXgkc8NpcbmlNw9yv8=

resolve-cwd@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/resolve-cwd/-/resolve-cwd-2.0.0.tgz#00a9f7387556e27038eae232caa372a6a59b665a"
  integrity sha1-AKn3OHVW4nA46uIyyqNypqWbZlo=
  dependencies:
    resolve-from "^3.0.0"

resolve-from@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/resolve-from/-/resolve-from-3.0.0.tgz#b22c7af7d9d6881bc8b6e653335eebcb0a188748"
  integrity sha1-six699nWiBvItuZTM17rywoYh0g=

resolve-from@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/resolve-from/-/resolve-from-4.0.0.tgz#4abcd852ad32dd7baabfe9b40e00a36db5f392e6"
  integrity sha512-pb/MYmXstAkysRFx8piNI1tGFNQIFA3vkE3Gq4EuA1dF6gHp/+vgZqsCGJapvy8N3Q+4o7FwvquPJcnZ7RYy4g==

resolve-url-loader@3.1.1:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/resolve-url-loader/-/resolve-url-loader-3.1.1.tgz#28931895fa1eab9be0647d3b2958c100ae3c0bf0"
  integrity sha512-K1N5xUjj7v0l2j/3Sgs5b8CjrrgtC70SmdCuZiJ8tSyb5J+uk3FoeZ4b7yTnH6j7ngI+Bc5bldHJIa8hYdu2gQ==
  dependencies:
    adjust-sourcemap-loader "2.0.0"
    camelcase "5.3.1"
    compose-function "3.0.3"
    convert-source-map "1.7.0"
    es6-iterator "2.0.3"
    loader-utils "1.2.3"
    postcss "7.0.21"
    rework "1.0.1"
    rework-visit "1.0.0"
    source-map "0.6.1"

resolve-url@^0.2.1:
  version "0.2.1"
  resolved "https://registry.yarnpkg.com/resolve-url/-/resolve-url-0.2.1.tgz#2c637fe77c893afd2a663fe21aa9080068e2052a"
  integrity sha1-LGN/53yJOv0qZj/iGqkIAGjiBSo=

resolve@1.1.7:
  version "1.1.7"
  resolved "https://registry.yarnpkg.com/resolve/-/resolve-1.1.7.tgz#203114d82ad2c5ed9e8e0411b3932875e889e97b"
  integrity sha1-IDEU2CrSxe2ejgQRs5ModeiJ6Xs=

resolve@1.15.0:
  version "1.15.0"
  resolved "https://registry.yarnpkg.com/resolve/-/resolve-1.15.0.tgz#1b7ca96073ebb52e741ffd799f6b39ea462c67f5"
  integrity sha512-+hTmAldEGE80U2wJJDC1lebb5jWqvTYAfm3YZ1ckk1gBr0MnCqUKlwK1e+anaFljIl+F5tR5IoZcm4ZDA1zMQw==
  dependencies:
    path-parse "^1.0.6"

resolve@^1.10.0, resolve@^1.12.0, resolve@^1.13.1, resolve@^1.15.1, resolve@^1.3.2, resolve@^1.8.1:
  version "1.15.1"
  resolved "https://registry.yarnpkg.com/resolve/-/resolve-1.15.1.tgz#27bdcdeffeaf2d6244b95bb0f9f4b4653451f3e8"
  integrity sha512-84oo6ZTtoTUpjgNEr5SJyzQhzL72gaRodsSfyxC/AXRvwu0Yse9H8eF9IpGo7b8YetZhlI6v7ZQ6bKBFV/6S7w==
  dependencies:
    path-parse "^1.0.6"

restore-cursor@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/restore-cursor/-/restore-cursor-3.1.0.tgz#39f67c54b3a7a58cea5236d95cf0034239631f7e"
  integrity sha512-l+sSefzHpj5qimhFSE5a8nufZYAM3sBSVMAPtYkmC+4EH2anSGaEMXSD0izRQbu9nfyQ9y5JrVmp7E8oZrUjvA==
  dependencies:
    onetime "^5.1.0"
    signal-exit "^3.0.2"

ret@~0.1.10:
  version "0.1.15"
  resolved "https://registry.yarnpkg.com/ret/-/ret-0.1.15.tgz#b8a4825d5bdb1fc3f6f53c2bc33f81388681c7bc"
  integrity sha512-TTlYpa+OL+vMMNG24xSlQGEJ3B/RzEfUlLct7b5G/ytav+wPrplCpVMFuwzXbkecJrb6IYo1iFb0S9v37754mg==

retry@^0.12.0:
  version "0.12.0"
  resolved "https://registry.yarnpkg.com/retry/-/retry-0.12.0.tgz#1b42a6266a21f07421d1b0b54b7dc167b01c013b"
  integrity sha1-G0KmJmoh8HQh0bC1S33BZ7AcATs=

rework-visit@1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/rework-visit/-/rework-visit-1.0.0.tgz#9945b2803f219e2f7aca00adb8bc9f640f842c9a"
  integrity sha1-mUWygD8hni96ygCtuLyfZA+ELJo=

rework@1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/rework/-/rework-1.0.1.tgz#30806a841342b54510aa4110850cd48534144aa7"
  integrity sha1-MIBqhBNCtUUQqkEQhQzUhTQUSqc=
  dependencies:
    convert-source-map "^0.3.3"
    css "^2.0.0"

rgb-regex@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/rgb-regex/-/rgb-regex-1.0.1.tgz#c0e0d6882df0e23be254a475e8edd41915feaeb1"
  integrity sha1-wODWiC3w4jviVKR16O3UGRX+rrE=

rgba-regex@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/rgba-regex/-/rgba-regex-1.0.0.tgz#43374e2e2ca0968b0ef1523460b7d730ff22eeb3"
  integrity sha1-QzdOLiyglosO8VI0YLfXMP8i7rM=

rimraf@2.6.3:
  version "2.6.3"
  resolved "https://registry.yarnpkg.com/rimraf/-/rimraf-2.6.3.tgz#b2d104fe0d8fb27cf9e0a1cda8262dd3833c6cab"
  integrity sha512-mwqeW5XsA2qAejG46gYdENaxXjx9onRNCfn7L0duuP4hCuTIi/QO7PDK07KJfp1d+izWPrzEJDcSqBa0OZQriA==
  dependencies:
    glob "^7.1.3"

rimraf@^2.5.4, rimraf@^2.6.3, rimraf@^2.7.1:
  version "2.7.1"
  resolved "https://registry.yarnpkg.com/rimraf/-/rimraf-2.7.1.tgz#35797f13a7fdadc566142c29d4f07ccad483e3ec"
  integrity sha512-uWjbaKIK3T1OSVptzX7Nl6PvQ3qAGtKEtVRjRuazjfL3Bx5eI409VZSqgND+4UNnmzLVdPj9FqFJNPqBZFve4w==
  dependencies:
    glob "^7.1.3"

ripemd160@^2.0.0, ripemd160@^2.0.1:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/ripemd160/-/ripemd160-2.0.2.tgz#a1c1a6f624751577ba5d07914cbc92850585890c"
  integrity sha512-ii4iagi25WusVoiC4B4lq7pbXfAp3D9v5CwfkY33vffw2+pkDjY1D8GaN7spsxvCSx8dkPqOZCEZyfxcmJG2IA==
  dependencies:
    hash-base "^3.0.0"
    inherits "^2.0.1"

rsvp@^4.8.4:
  version "4.8.5"
  resolved "https://registry.yarnpkg.com/rsvp/-/rsvp-4.8.5.tgz#c8f155311d167f68f21e168df71ec5b083113734"
  integrity sha512-nfMOlASu9OnRJo1mbEk2cz0D56a1MBNrJ7orjRZQG10XDyuvwksKbuXNp6qa+kbn839HwjwhBzhFmdsaEAfauA==

run-async@^2.2.0, run-async@^2.4.0:
  version "2.4.0"
  resolved "https://registry.yarnpkg.com/run-async/-/run-async-2.4.0.tgz#e59054a5b86876cfae07f431d18cbaddc594f1e8"
  integrity sha512-xJTbh/d7Lm7SBhc1tNvTpeCHaEzoyxPrqNlvSdMfBTYwaY++UJFyXUOxAtsRUXjlqOfj8luNaR9vjCh4KeV+pg==
  dependencies:
    is-promise "^2.1.0"

run-queue@^1.0.0, run-queue@^1.0.3:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/run-queue/-/run-queue-1.0.3.tgz#e848396f057d223f24386924618e25694161ec47"
  integrity sha1-6Eg5bwV9Ij8kOGkkYY4laUFh7Ec=
  dependencies:
    aproba "^1.1.1"

rxjs@^6.5.3:
  version "6.5.4"
  resolved "https://registry.yarnpkg.com/rxjs/-/rxjs-6.5.4.tgz#e0777fe0d184cec7872df147f303572d414e211c"
  integrity sha512-naMQXcgEo3csAEGvw/NydRA0fuS2nDZJiw1YUWFKU7aPPAPGZEsD4Iimit96qwCieH6y614MCLYwdkrWx7z/7Q==
  dependencies:
    tslib "^1.9.0"

safe-buffer@5.1.2, safe-buffer@~5.1.0, safe-buffer@~5.1.1:
  version "5.1.2"
  resolved "https://registry.yarnpkg.com/safe-buffer/-/safe-buffer-5.1.2.tgz#991ec69d296e0313747d59bdfd2b745c35f8828d"
  integrity sha512-Gd2UZBJDkXlY7GbJxfsE8/nvKkUEU1G38c1siN6QP6a9PT9MmHB8GnpscSmMJSoF8LOIrt8ud/wPtojys4G6+g==

safe-buffer@>=5.1.0, safe-buffer@^5.0.1, safe-buffer@^5.1.0, safe-buffer@^5.1.1, safe-buffer@^5.1.2, safe-buffer@~5.2.0:
  version "5.2.0"
  resolved "https://registry.yarnpkg.com/safe-buffer/-/safe-buffer-5.2.0.tgz#b74daec49b1148f88c64b68d49b1e815c1f2f519"
  integrity sha512-fZEwUGbVl7kouZs1jCdMLdt95hdIv0ZeHg6L7qPeciMZhZ+/gdesW4wgTARkrFWEpspjEATAzUGPG8N2jJiwbg==

safe-regex@^1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/safe-regex/-/safe-regex-1.1.0.tgz#40a3669f3b077d1e943d44629e157dd48023bf2e"
  integrity sha1-QKNmnzsHfR6UPURinhV91IAjvy4=
  dependencies:
    ret "~0.1.10"

"safer-buffer@>= 2.1.2 < 3", safer-buffer@^2.0.2, safer-buffer@^2.1.0, safer-buffer@~2.1.0:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/safer-buffer/-/safer-buffer-2.1.2.tgz#44fa161b0187b9549dd84bb91802f9bd8385cd6a"
  integrity sha512-YZo3K82SD7Riyi0E1EQPojLz7kpepnSQI9IyPbHHg1XXXevb5dJI7tpyN2ADxGcQbHG7vcyRHk0cbwqcQriUtg==

sane@^4.0.3:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/sane/-/sane-4.1.0.tgz#ed881fd922733a6c461bc189dc2b6c006f3ffded"
  integrity sha512-hhbzAgTIX8O7SHfp2c8/kREfEn4qO/9q8C9beyY6+tvZ87EpoZ3i1RIEvp27YBswnNbY9mWd6paKVmKbAgLfZA==
  dependencies:
    "@cnakazawa/watch" "^1.0.3"
    anymatch "^2.0.0"
    capture-exit "^2.0.0"
    exec-sh "^0.3.2"
    execa "^1.0.0"
    fb-watchman "^2.0.0"
    micromatch "^3.1.4"
    minimist "^1.1.1"
    walker "~1.0.5"

sanitize.css@^10.0.0:
  version "10.0.0"
  resolved "https://registry.yarnpkg.com/sanitize.css/-/sanitize.css-10.0.0.tgz#b5cb2547e96d8629a60947544665243b1dc3657a"
  integrity sha512-vTxrZz4dX5W86M6oVWVdOVe72ZiPs41Oi7Z6Km4W5Turyz28mrXSJhhEBZoRtzJWIv3833WKVwLSDWWkEfupMg==

sass-loader@8.0.2:
  version "8.0.2"
  resolved "https://registry.yarnpkg.com/sass-loader/-/sass-loader-8.0.2.tgz#debecd8c3ce243c76454f2e8290482150380090d"
  integrity sha512-7o4dbSK8/Ol2KflEmSco4jTjQoV988bM82P9CZdmo9hR3RLnvNc0ufMNdMrB0caq38JQ/FgF4/7RcbcfKzxoFQ==
  dependencies:
    clone-deep "^4.0.1"
    loader-utils "^1.2.3"
    neo-async "^2.6.1"
    schema-utils "^2.6.1"
    semver "^6.3.0"

sax@^1.2.4, sax@~1.2.4:
  version "1.2.4"
  resolved "https://registry.yarnpkg.com/sax/-/sax-1.2.4.tgz#2816234e2378bddc4e5354fab5caa895df7100d9"
  integrity sha512-NqVDv9TpANUjFm0N8uM5GxL36UgKi9/atZw+x7YFnQ8ckwFGKrl4xX4yWtrey3UJm5nP1kUbnYgLopqWNSRhWw==

saxes@^3.1.9:
  version "3.1.11"
  resolved "https://registry.yarnpkg.com/saxes/-/saxes-3.1.11.tgz#d59d1fd332ec92ad98a2e0b2ee644702384b1c5b"
  integrity sha512-Ydydq3zC+WYDJK1+gRxRapLIED9PWeSuuS41wqyoRmzvhhh9nc+QQrVMKJYzJFULazeGhzSV0QleN2wD3boh2g==
  dependencies:
    xmlchars "^2.1.1"

scheduler@^0.19.1:
  version "0.19.1"
  resolved "https://registry.yarnpkg.com/scheduler/-/scheduler-0.19.1.tgz#4f3e2ed2c1a7d65681f4c854fa8c5a1ccb40f196"
  integrity sha512-n/zwRWRYSUj0/3g/otKDRPMh6qv2SYMWNq85IEa8iZyAv8od9zDYpGSnpBEjNgcMNq6Scbu5KfIPxNF72R/2EA==
  dependencies:
    loose-envify "^1.1.0"
    object-assign "^4.1.1"

schema-utils@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/schema-utils/-/schema-utils-1.0.0.tgz#0b79a93204d7b600d4b2850d1f66c2a34951c770"
  integrity sha512-i27Mic4KovM/lnGsy8whRCHhc7VicJajAjTrYg11K9zfZXnYIt4k5F+kZkwjnrhKzLic/HLU4j11mjsz2G/75g==
  dependencies:
    ajv "^6.1.0"
    ajv-errors "^1.0.0"
    ajv-keywords "^3.1.0"

schema-utils@^2.5.0, schema-utils@^2.6.0, schema-utils@^2.6.1, schema-utils@^2.6.4, schema-utils@^2.6.5:
  version "2.6.5"
  resolved "https://registry.yarnpkg.com/schema-utils/-/schema-utils-2.6.5.tgz#c758f0a7e624263073d396e29cd40aa101152d8a"
  integrity sha512-5KXuwKziQrTVHh8j/Uxz+QUbxkaLW9X/86NBlx/gnKgtsZA2GIVMUn17qWhRFwF8jdYb3Dig5hRO/W5mZqy6SQ==
  dependencies:
    ajv "^6.12.0"
    ajv-keywords "^3.4.1"

select-hose@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/select-hose/-/select-hose-2.0.0.tgz#625d8658f865af43ec962bfc376a37359a4994ca"
  integrity sha1-Yl2GWPhlr0Psliv8N2o3NZpJlMo=

selfsigned@^1.10.7:
  version "1.10.7"
  resolved "https://registry.yarnpkg.com/selfsigned/-/selfsigned-1.10.7.tgz#da5819fd049d5574f28e88a9bcc6dbc6e6f3906b"
  integrity sha512-8M3wBCzeWIJnQfl43IKwOmC4H/RAp50S8DF60znzjW5GVqTcSe2vWclt7hmYVPkKPlHWOu5EaWOMZ2Y6W8ZXTA==
  dependencies:
    node-forge "0.9.0"

"semver@2 || 3 || 4 || 5", semver@^5.4.1, semver@^5.5.0, semver@^5.5.1, semver@^5.6.0:
  version "5.7.1"
  resolved "https://registry.yarnpkg.com/semver/-/semver-5.7.1.tgz#a954f931aeba508d307bbf069eff0c01c96116f7"
  integrity sha512-sauaDf/PZdVgrLTNYHRtpXa1iRiKcaebiKQ1BJdpQlWH2lCvexQdX55snPFyK7QzpudqbCI0qXFfOasHdyNDGQ==

semver@6.3.0, semver@^6.0.0, semver@^6.1.2, semver@^6.2.0, semver@^6.3.0:
  version "6.3.0"
  resolved "https://registry.yarnpkg.com/semver/-/semver-6.3.0.tgz#ee0a64c8af5e8ceea67687b133761e1becbd1d3d"
  integrity sha512-b39TBaTSfV6yBrapU89p5fKekE2m/NwnDocOVruQFS1/veMgdzuPcnOM34M6CwxW8jH/lxEa5rBoDeUwu5HHTw==

semver@7.0.0:
  version "7.0.0"
  resolved "https://registry.yarnpkg.com/semver/-/semver-7.0.0.tgz#5f3ca35761e47e05b206c6daff2cf814f0316b8e"
  integrity sha512-+GB6zVA9LWh6zovYQLALHwv5rb2PHGlJi3lfiqIHxR0uuwCgefcOJc59v9fv1w8GbStwxuuqqAjI9NMAOOgq1A==

send@0.17.1:
  version "0.17.1"
  resolved "https://registry.yarnpkg.com/send/-/send-0.17.1.tgz#c1d8b059f7900f7466dd4938bdc44e11ddb376c8"
  integrity sha512-BsVKsiGcQMFwT8UxypobUKyv7irCNRHk1T0G680vk88yf6LBByGcZJOTJCrTP2xVN6yI+XjPJcNuE3V4fT9sAg==
  dependencies:
    debug "2.6.9"
    depd "~1.1.2"
    destroy "~1.0.4"
    encodeurl "~1.0.2"
    escape-html "~1.0.3"
    etag "~1.8.1"
    fresh "0.5.2"
    http-errors "~1.7.2"
    mime "1.6.0"
    ms "2.1.1"
    on-finished "~2.3.0"
    range-parser "~1.2.1"
    statuses "~1.5.0"

serialize-javascript@^2.1.2:
  version "2.1.2"
  resolved "https://registry.yarnpkg.com/serialize-javascript/-/serialize-javascript-2.1.2.tgz#ecec53b0e0317bdc95ef76ab7074b7384785fa61"
  integrity sha512-rs9OggEUF0V4jUSecXazOYsLfu7OGK2qIn3c7IPBiffz32XniEp/TX9Xmc9LQfK2nQ2QKHvZ2oygKUGU0lG4jQ==

serve-index@^1.9.1:
  version "1.9.1"
  resolved "https://registry.yarnpkg.com/serve-index/-/serve-index-1.9.1.tgz#d3768d69b1e7d82e5ce050fff5b453bea12a9239"
  integrity sha1-03aNabHn2C5c4FD/9bRTvqEqkjk=
  dependencies:
    accepts "~1.3.4"
    batch "0.6.1"
    debug "2.6.9"
    escape-html "~1.0.3"
    http-errors "~1.6.2"
    mime-types "~2.1.17"
    parseurl "~1.3.2"

serve-static@1.14.1:
  version "1.14.1"
  resolved "https://registry.yarnpkg.com/serve-static/-/serve-static-1.14.1.tgz#666e636dc4f010f7ef29970a88a674320898b2f9"
  integrity sha512-JMrvUwE54emCYWlTI+hGrGv5I8dEwmco/00EvkzIIsR7MqrHonbD9pO2MOfFnpFntl7ecpZs+3mW+XbQZu9QCg==
  dependencies:
    encodeurl "~1.0.2"
    escape-html "~1.0.3"
    parseurl "~1.3.3"
    send "0.17.1"

set-blocking@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/set-blocking/-/set-blocking-2.0.0.tgz#045f9782d011ae9a6803ddd382b24392b3d890f7"
  integrity sha1-BF+XgtARrppoA93TgrJDkrPYkPc=

set-value@^2.0.0, set-value@^2.0.1:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/set-value/-/set-value-2.0.1.tgz#a18d40530e6f07de4228c7defe4227af8cad005b"
  integrity sha512-JxHc1weCN68wRY0fhCoXpyK55m/XPHafOmK4UWD7m2CI14GMcFypt4w/0+NV5f/ZMby2F6S2wwA7fgynh9gWSw==
  dependencies:
    extend-shallow "^2.0.1"
    is-extendable "^0.1.1"
    is-plain-object "^2.0.3"
    split-string "^3.0.1"

setimmediate@^1.0.4:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/setimmediate/-/setimmediate-1.0.5.tgz#290cbb232e306942d7d7ea9b83732ab7856f8285"
  integrity sha1-KQy7Iy4waULX1+qbg3Mqt4VvgoU=

setprototypeof@1.1.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/setprototypeof/-/setprototypeof-1.1.0.tgz#d0bd85536887b6fe7c0d818cb962d9d91c54e656"
  integrity sha512-BvE/TwpZX4FXExxOxZyRGQQv651MSwmWKZGqvmPcRIjDqWub67kTKuIMx43cZZrS/cBBzwBcNDWoFxt2XEFIpQ==

setprototypeof@1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/setprototypeof/-/setprototypeof-1.1.1.tgz#7e95acb24aa92f5885e0abef5ba131330d4ae683"
  integrity sha512-JvdAWfbXeIGaZ9cILp38HntZSFSo3mWg6xGcJJsd+d4aRMOqauag1C63dJfDw7OaMYwEbHMOxEZ1lqVRYP2OAw==

sha.js@^2.4.0, sha.js@^2.4.8:
  version "2.4.11"
  resolved "https://registry.yarnpkg.com/sha.js/-/sha.js-2.4.11.tgz#37a5cf0b81ecbc6943de109ba2960d1b26584ae7"
  integrity sha512-QMEp5B7cftE7APOjk5Y6xgrbWu+WkLVQwk8JNjZ8nKRciZaByEW6MubieAiToS7+dwvrjGhH8jRXz3MVd0AYqQ==
  dependencies:
    inherits "^2.0.1"
    safe-buffer "^5.0.1"

shallow-clone@^0.1.2:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/shallow-clone/-/shallow-clone-0.1.2.tgz#5909e874ba77106d73ac414cfec1ffca87d97060"
  integrity sha1-WQnodLp3EG1zrEFM/sH/yofZcGA=
  dependencies:
    is-extendable "^0.1.1"
    kind-of "^2.0.1"
    lazy-cache "^0.2.3"
    mixin-object "^2.0.1"

shallow-clone@^3.0.0:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/shallow-clone/-/shallow-clone-3.0.1.tgz#8f2981ad92531f55035b01fb230769a40e02efa3"
  integrity sha512-/6KqX+GVUdqPuPPd2LxDDxzX6CAbjJehAAOKlNpqqUpAqPM6HeL8f+o3a+JsyGjn2lv0WY8UsTgUJjU9Ok55NA==
  dependencies:
    kind-of "^6.0.2"

shebang-command@^1.2.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/shebang-command/-/shebang-command-1.2.0.tgz#44aac65b695b03398968c39f363fee5deafdf1ea"
  integrity sha1-RKrGW2lbAzmJaMOfNj/uXer98eo=
  dependencies:
    shebang-regex "^1.0.0"

shebang-command@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/shebang-command/-/shebang-command-2.0.0.tgz#ccd0af4f8835fbdc265b82461aaf0c36663f34ea"
  integrity sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==
  dependencies:
    shebang-regex "^3.0.0"

shebang-regex@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/shebang-regex/-/shebang-regex-1.0.0.tgz#da42f49740c0b42db2ca9728571cb190c98efea3"
  integrity sha1-2kL0l0DAtC2yypcoVxyxkMmO/qM=

shebang-regex@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/shebang-regex/-/shebang-regex-3.0.0.tgz#ae16f1644d873ecad843b0307b143362d4c42172"
  integrity sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==

shell-quote@1.7.2:
  version "1.7.2"
  resolved "https://registry.yarnpkg.com/shell-quote/-/shell-quote-1.7.2.tgz#67a7d02c76c9da24f99d20808fcaded0e0e04be2"
  integrity sha512-mRz/m/JVscCrkMyPqHc/bczi3OQHkLTqXHEFu0zDhK/qfv3UcOA4SVmRCLmos4bhjr9ekVQubj/R7waKapmiQg==

shellwords@^0.1.1:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/shellwords/-/shellwords-0.1.1.tgz#d6b9181c1a48d397324c84871efbcfc73fc0654b"
  integrity sha512-vFwSUfQvqybiICwZY5+DAWIPLKsWO31Q91JSKl3UYv+K5c2QRPzn0qzec6QPu1Qc9eHYItiP3NdJqNVqetYAww==

side-channel@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/side-channel/-/side-channel-1.0.2.tgz#df5d1abadb4e4bf4af1cd8852bf132d2f7876947"
  integrity sha512-7rL9YlPHg7Ancea1S96Pa8/QWb4BtXL/TZvS6B8XFetGBeuhAsfmUspK6DokBeZ64+Kj9TCNRD/30pVz1BvQNA==
  dependencies:
    es-abstract "^1.17.0-next.1"
    object-inspect "^1.7.0"

signal-exit@^3.0.0, signal-exit@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/signal-exit/-/signal-exit-3.0.2.tgz#b5fdc08f1287ea1178628e415e25132b73646c6d"
  integrity sha1-tf3AjxKH6hF4Yo5BXiUTK3NkbG0=

simple-swizzle@^0.2.2:
  version "0.2.2"
  resolved "https://registry.yarnpkg.com/simple-swizzle/-/simple-swizzle-0.2.2.tgz#a4da6b635ffcccca33f70d17cb92592de95e557a"
  integrity sha1-pNprY1/8zMoz9w0Xy5JZLeleVXo=
  dependencies:
    is-arrayish "^0.3.1"

sisteransi@^1.0.4:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/sisteransi/-/sisteransi-1.0.5.tgz#134d681297756437cc05ca01370d3a7a571075ed"
  integrity sha512-bLGGlR1QxBcynn2d5YmDX4MGjlZvy2MRBDRNHLJ8VI6l6+9FUiyTFNJ0IveOSP0bcXgVDPRcfGqA0pjaqUpfVg==

slash@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/slash/-/slash-1.0.0.tgz#c41f2f6c39fc16d1cd17ad4b5d896114ae470d55"
  integrity sha1-xB8vbDn8FtHNF61LXYlhFK5HDVU=

slash@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/slash/-/slash-2.0.0.tgz#de552851a1759df3a8f206535442f5ec4ddeab44"
  integrity sha512-ZYKh3Wh2z1PpEXWr0MpSBZ0V6mZHAQfYevttO11c51CaWjGTaadiKZ+wVt1PbMlDV5qhMFslpZCemhwOK7C89A==

slash@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/slash/-/slash-3.0.0.tgz#6539be870c165adbd5240220dbe361f1bc4d4634"
  integrity sha512-g9Q1haeby36OSStwb4ntCGGGaKsaVSjQ68fBxoQcutl5fS1vuY18H3wSt3jFyFtrkx+Kz0V1G85A4MyAdDMi2Q==

slice-ansi@^2.1.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/slice-ansi/-/slice-ansi-2.1.0.tgz#cacd7693461a637a5788d92a7dd4fba068e81636"
  integrity sha512-Qu+VC3EwYLldKa1fCxuuvULvSJOKEgk9pi8dZeCVK7TqBfUNTH4sFkk4joj8afVSfAYgJoSOetjx9QWOJ5mYoQ==
  dependencies:
    ansi-styles "^3.2.0"
    astral-regex "^1.0.0"
    is-fullwidth-code-point "^2.0.0"

snapdragon-node@^2.0.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/snapdragon-node/-/snapdragon-node-2.1.1.tgz#6c175f86ff14bdb0724563e8f3c1b021a286853b"
  integrity sha512-O27l4xaMYt/RSQ5TR3vpWCAB5Kb/czIcqUFOM/C4fYcLnbZUc1PkjTAMjof2pBWaSTwOUd6qUHcFGVGj7aIwnw==
  dependencies:
    define-property "^1.0.0"
    isobject "^3.0.0"
    snapdragon-util "^3.0.1"

snapdragon-util@^3.0.1:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/snapdragon-util/-/snapdragon-util-3.0.1.tgz#f956479486f2acd79700693f6f7b805e45ab56e2"
  integrity sha512-mbKkMdQKsjX4BAL4bRYTj21edOf8cN7XHdYUJEe+Zn99hVEYcMvKPct1IqNe7+AZPirn8BCDOQBHQZknqmKlZQ==
  dependencies:
    kind-of "^3.2.0"

snapdragon@^0.8.1:
  version "0.8.2"
  resolved "https://registry.yarnpkg.com/snapdragon/-/snapdragon-0.8.2.tgz#64922e7c565b0e14204ba1aa7d6964278d25182d"
  integrity sha512-FtyOnWN/wCHTVXOMwvSv26d+ko5vWlIDD6zoUJ7LW8vh+ZBC8QdljveRP+crNrtBwioEUWy/4dMtbBjA4ioNlg==
  dependencies:
    base "^0.11.1"
    debug "^2.2.0"
    define-property "^0.2.5"
    extend-shallow "^2.0.1"
    map-cache "^0.2.2"
    source-map "^0.5.6"
    source-map-resolve "^0.5.0"
    use "^3.1.0"

sockjs-client@1.4.0:
  version "1.4.0"
  resolved "https://registry.yarnpkg.com/sockjs-client/-/sockjs-client-1.4.0.tgz#c9f2568e19c8fd8173b4997ea3420e0bb306c7d5"
  integrity sha512-5zaLyO8/nri5cua0VtOrFXBPK1jbL4+1cebT/mmKA1E1ZXOvJrII75bPu0l0k843G/+iAbhEqzyKr0w/eCCj7g==
  dependencies:
    debug "^3.2.5"
    eventsource "^1.0.7"
    faye-websocket "~0.11.1"
    inherits "^2.0.3"
    json3 "^3.3.2"
    url-parse "^1.4.3"

sockjs@0.3.19:
  version "0.3.19"
  resolved "https://registry.yarnpkg.com/sockjs/-/sockjs-0.3.19.tgz#d976bbe800af7bd20ae08598d582393508993c0d"
  integrity sha512-V48klKZl8T6MzatbLlzzRNhMepEys9Y4oGFpypBFFn1gLI/QQ9HtLLyWJNbPlwGLelOVOEijUbTTJeLLI59jLw==
  dependencies:
    faye-websocket "^0.10.0"
    uuid "^3.0.1"

sort-keys@^1.0.0:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/sort-keys/-/sort-keys-1.1.2.tgz#441b6d4d346798f1b4e49e8920adfba0e543f9ad"
  integrity sha1-RBttTTRnmPG05J6JIK37oOVD+a0=
  dependencies:
    is-plain-obj "^1.0.0"

source-list-map@^2.0.0:
  version "2.0.1"
  resolved "https://registry.yarnpkg.com/source-list-map/-/source-list-map-2.0.1.tgz#3993bd873bfc48479cca9ea3a547835c7c154b34"
  integrity sha512-qnQ7gVMxGNxsiL4lEuJwe/To8UnK7fAnmbGEEH8RpLouuKbeEm0lhbQVFIrNSuB+G7tVrAlVsZgETT5nljf+Iw==

source-map-resolve@^0.5.0, source-map-resolve@^0.5.2:
  version "0.5.3"
  resolved "https://registry.yarnpkg.com/source-map-resolve/-/source-map-resolve-0.5.3.tgz#190866bece7553e1f8f267a2ee82c606b5509a1a"
  integrity sha512-Htz+RnsXWk5+P2slx5Jh3Q66vhQj1Cllm0zvnaY98+NFx+Dv2CF/f5O/t8x+KaNdrdIAsruNzoh/KpialbqAnw==
  dependencies:
    atob "^2.1.2"
    decode-uri-component "^0.2.0"
    resolve-url "^0.2.1"
    source-map-url "^0.4.0"
    urix "^0.1.0"

source-map-support@^0.5.6, source-map-support@~0.5.12:
  version "0.5.16"
  resolved "https://registry.yarnpkg.com/source-map-support/-/source-map-support-0.5.16.tgz#0ae069e7fe3ba7538c64c98515e35339eac5a042"
  integrity sha512-efyLRJDr68D9hBBNIPWFjhpFzURh+KJykQwvMyW5UiZzYwoF6l4YMMDIJJEyFWxWCqfyxLzz6tSfUFR+kXXsVQ==
  dependencies:
    buffer-from "^1.0.0"
    source-map "^0.6.0"

source-map-url@^0.4.0:
  version "0.4.0"
  resolved "https://registry.yarnpkg.com/source-map-url/-/source-map-url-0.4.0.tgz#3e935d7ddd73631b97659956d55128e87b5084a3"
  integrity sha1-PpNdfd1zYxuXZZlW1VEo6HtQhKM=

source-map@0.6.1, source-map@^0.6.0, source-map@^0.6.1, source-map@~0.6.0, source-map@~0.6.1:
  version "0.6.1"
  resolved "https://registry.yarnpkg.com/source-map/-/source-map-0.6.1.tgz#74722af32e9614e9c287a8d0bbde48b5e2f1a263"
  integrity sha512-UjgapumWlbMhkBgzT7Ykc5YXUT46F0iKu8SGXq0bcwP5dz/h0Plj6enJqjz1Zbq2l5WaqYnrVbwWOWMyF3F47g==

source-map@^0.5.0, source-map@^0.5.6:
  version "0.5.7"
  resolved "https://registry.yarnpkg.com/source-map/-/source-map-0.5.7.tgz#8a039d2d1021d22d1ea14c80d8ea468ba2ef3fcc"
  integrity sha1-igOdLRAh0i0eoUyA2OpGi6LvP8w=

spdx-correct@^3.0.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/spdx-correct/-/spdx-correct-3.1.0.tgz#fb83e504445268f154b074e218c87c003cd31df4"
  integrity sha512-lr2EZCctC2BNR7j7WzJ2FpDznxky1sjfxvvYEyzxNyb6lZXHODmEoJeFu4JupYlkfha1KZpJyoqiJ7pgA1qq8Q==
  dependencies:
    spdx-expression-parse "^3.0.0"
    spdx-license-ids "^3.0.0"

spdx-exceptions@^2.1.0:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/spdx-exceptions/-/spdx-exceptions-2.2.0.tgz#2ea450aee74f2a89bfb94519c07fcd6f41322977"
  integrity sha512-2XQACfElKi9SlVb1CYadKDXvoajPgBVPn/gOQLrTvHdElaVhr7ZEbqJaRnJLVNeaI4cMEAgVCeBMKF6MWRDCRA==

spdx-expression-parse@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/spdx-expression-parse/-/spdx-expression-parse-3.0.0.tgz#99e119b7a5da00e05491c9fa338b7904823b41d0"
  integrity sha512-Yg6D3XpRD4kkOmTpdgbUiEJFKghJH03fiC1OPll5h/0sO6neh2jqRDVHOQ4o/LMea0tgCkbMgea5ip/e+MkWyg==
  dependencies:
    spdx-exceptions "^2.1.0"
    spdx-license-ids "^3.0.0"

spdx-license-ids@^3.0.0:
  version "3.0.5"
  resolved "https://registry.yarnpkg.com/spdx-license-ids/-/spdx-license-ids-3.0.5.tgz#3694b5804567a458d3c8045842a6358632f62654"
  integrity sha512-J+FWzZoynJEXGphVIS+XEh3kFSjZX/1i9gFBaWQcB+/tmpe2qUsSBABpcxqxnAxFdiUFEgAX1bjYGQvIZmoz9Q==

spdy-transport@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/spdy-transport/-/spdy-transport-3.0.0.tgz#00d4863a6400ad75df93361a1608605e5dcdcf31"
  integrity sha512-hsLVFE5SjA6TCisWeJXFKniGGOpBgMLmerfO2aCyCU5s7nJ/rpAepqmFifv/GCbSbueEeAJJnmSQ2rKC/g8Fcw==
  dependencies:
    debug "^4.1.0"
    detect-node "^2.0.4"
    hpack.js "^2.1.6"
    obuf "^1.1.2"
    readable-stream "^3.0.6"
    wbuf "^1.7.3"

spdy@^4.0.1:
  version "4.0.1"
  resolved "https://registry.yarnpkg.com/spdy/-/spdy-4.0.1.tgz#6f12ed1c5db7ea4f24ebb8b89ba58c87c08257f2"
  integrity sha512-HeZS3PBdMA+sZSu0qwpCxl3DeALD5ASx8pAX0jZdKXSpPWbQ6SYGnlg3BBmYLx5LtiZrmkAZfErCm2oECBcioA==
  dependencies:
    debug "^4.1.0"
    handle-thing "^2.0.0"
    http-deceiver "^1.2.7"
    select-hose "^2.0.0"
    spdy-transport "^3.0.0"

split-string@^3.0.1, split-string@^3.0.2:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/split-string/-/split-string-3.1.0.tgz#7cb09dda3a86585705c64b39a6466038682e8fe2"
  integrity sha512-NzNVhJDYpwceVVii8/Hu6DKfD2G+NrQHlS/V/qgv763EYudVwEcMQNxd2lh+0VrUByXN/oJkl5grOhYWvQUYiw==
  dependencies:
    extend-shallow "^3.0.0"

sprintf-js@~1.0.2:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/sprintf-js/-/sprintf-js-1.0.3.tgz#04e6926f662895354f3dd015203633b857297e2c"
  integrity sha1-BOaSb2YolTVPPdAVIDYzuFcpfiw=

sshpk@^1.7.0:
  version "1.16.1"
  resolved "https://registry.yarnpkg.com/sshpk/-/sshpk-1.16.1.tgz#fb661c0bef29b39db40769ee39fa70093d6f6877"
  integrity sha512-HXXqVUq7+pcKeLqqZj6mHFUMvXtOJt1uoUx09pFW6011inTMxqI8BA8PM95myrIyyKwdnzjdFjLiE6KBPVtJIg==
  dependencies:
    asn1 "~0.2.3"
    assert-plus "^1.0.0"
    bcrypt-pbkdf "^1.0.0"
    dashdash "^1.12.0"
    ecc-jsbn "~0.1.1"
    getpass "^0.1.1"
    jsbn "~0.1.0"
    safer-buffer "^2.0.2"
    tweetnacl "~0.14.0"

ssri@^6.0.1:
  version "6.0.1"
  resolved "https://registry.yarnpkg.com/ssri/-/ssri-6.0.1.tgz#2a3c41b28dd45b62b63676ecb74001265ae9edd8"
  integrity sha512-3Wge10hNcT1Kur4PDFwEieXSCMCJs/7WvSACcrMYrNp+b8kDL1/0wJch5Ni2WrtwEa2IO8OsVfeKIciKCDx/QA==
  dependencies:
    figgy-pudding "^3.5.1"

ssri@^7.0.0:
  version "7.1.0"
  resolved "https://registry.yarnpkg.com/ssri/-/ssri-7.1.0.tgz#92c241bf6de82365b5c7fb4bd76e975522e1294d"
  integrity sha512-77/WrDZUWocK0mvA5NTRQyveUf+wsrIc6vyrxpS8tVvYBcX215QbafrJR3KtkpskIzoFLqqNuuYQvxaMjXJ/0g==
  dependencies:
    figgy-pudding "^3.5.1"
    minipass "^3.1.1"

stable@^0.1.8:
  version "0.1.8"
  resolved "https://registry.yarnpkg.com/stable/-/stable-0.1.8.tgz#836eb3c8382fe2936feaf544631017ce7d47a3cf"
  integrity sha512-ji9qxRnOVfcuLDySj9qzhGSEFVobyt1kIOSkj1qZzYLzq7Tos/oUUWvotUPQLlrsidqsK6tBH89Bc9kL5zHA6w==

stack-utils@^1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/stack-utils/-/stack-utils-1.0.2.tgz#33eba3897788558bebfc2db059dc158ec36cebb8"
  integrity sha512-MTX+MeG5U994cazkjd/9KNAapsHnibjMLnfXodlkXw76JEea0UiNzrqidzo1emMwk7w5Qhc9jd4Bn9TBb1MFwA==

static-extend@^0.1.1:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/static-extend/-/static-extend-0.1.2.tgz#60809c39cbff55337226fd5e0b520f341f1fb5c6"
  integrity sha1-YICcOcv/VTNyJv1eC1IPNB8ftcY=
  dependencies:
    define-property "^0.2.5"
    object-copy "^0.1.0"

"statuses@>= 1.4.0 < 2", "statuses@>= 1.5.0 < 2", statuses@~1.5.0:
  version "1.5.0"
  resolved "https://registry.yarnpkg.com/statuses/-/statuses-1.5.0.tgz#161c7dac177659fd9811f43771fa99381478628c"
  integrity sha1-Fhx9rBd2Wf2YEfQ3cfqZOBR4Yow=

stealthy-require@^1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/stealthy-require/-/stealthy-require-1.1.1.tgz#35b09875b4ff49f26a777e509b3090a3226bf24b"
  integrity sha1-NbCYdbT/SfJqd35QmzCQoyJr8ks=

stream-browserify@^2.0.1:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/stream-browserify/-/stream-browserify-2.0.2.tgz#87521d38a44aa7ee91ce1cd2a47df0cb49dd660b"
  integrity sha512-nX6hmklHs/gr2FuxYDltq8fJA1GDlxKQCz8O/IM4atRqBH8OORmBNgfvW5gG10GT/qQ9u0CzIvr2X5Pkt6ntqg==
  dependencies:
    inherits "~2.0.1"
    readable-stream "^2.0.2"

stream-each@^1.1.0:
  version "1.2.3"
  resolved "https://registry.yarnpkg.com/stream-each/-/stream-each-1.2.3.tgz#ebe27a0c389b04fbcc233642952e10731afa9bae"
  integrity sha512-vlMC2f8I2u/bZGqkdfLQW/13Zihpej/7PmSiMQsbYddxuTsJp8vRe2x2FvVExZg7FaOds43ROAuFJwPR4MTZLw==
  dependencies:
    end-of-stream "^1.1.0"
    stream-shift "^1.0.0"

stream-http@^2.7.2:
  version "2.8.3"
  resolved "https://registry.yarnpkg.com/stream-http/-/stream-http-2.8.3.tgz#b2d242469288a5a27ec4fe8933acf623de6514fc"
  integrity sha512-+TSkfINHDo4J+ZobQLWiMouQYB+UVYFttRA94FpEzzJ7ZdqcL4uUUQ7WkdkI4DSozGmgBUE/a47L+38PenXhUw==
  dependencies:
    builtin-status-codes "^3.0.0"
    inherits "^2.0.1"
    readable-stream "^2.3.6"
    to-arraybuffer "^1.0.0"
    xtend "^4.0.0"

stream-shift@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/stream-shift/-/stream-shift-1.0.1.tgz#d7088281559ab2778424279b0877da3c392d5a3d"
  integrity sha512-AiisoFqQ0vbGcZgQPY1cdP2I76glaVA/RauYR4G4thNFgkTqr90yXTo4LYX60Jl+sIlPNHHdGSwo01AvbKUSVQ==

strict-uri-encode@^1.0.0:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/strict-uri-encode/-/strict-uri-encode-1.1.0.tgz#279b225df1d582b1f54e65addd4352e18faa0713"
  integrity sha1-J5siXfHVgrH1TmWt3UNS4Y+qBxM=

string-length@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/string-length/-/string-length-2.0.0.tgz#d40dbb686a3ace960c1cffca562bf2c45f8363ed"
  integrity sha1-1A27aGo6zpYMHP/KVivyxF+DY+0=
  dependencies:
    astral-regex "^1.0.0"
    strip-ansi "^4.0.0"

string-length@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/string-length/-/string-length-3.1.0.tgz#107ef8c23456e187a8abd4a61162ff4ac6e25837"
  integrity sha512-Ttp5YvkGm5v9Ijagtaz1BnN+k9ObpvS0eIBblPMp2YWL8FBmi9qblQ9fexc2k/CXFgrTIteU3jAw3payCnwSTA==
  dependencies:
    astral-regex "^1.0.0"
    strip-ansi "^5.2.0"

string-width@^1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/string-width/-/string-width-1.0.2.tgz#118bdf5b8cdc51a2a7e70d211e07e2b0b9b107d3"
  integrity sha1-EYvfW4zcUaKn5w0hHgfisLmxB9M=
  dependencies:
    code-point-at "^1.0.0"
    is-fullwidth-code-point "^1.0.0"
    strip-ansi "^3.0.0"

string-width@^2.0.0, string-width@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/string-width/-/string-width-2.1.1.tgz#ab93f27a8dc13d28cac815c462143a6d9012ae9e"
  integrity sha512-nOqH59deCq9SRHlxq1Aw85Jnt4w6KvLKqWVik6oA9ZklXLNIOlqg4F2yrT1MVaTjAqvVwdfeZ7w7aCvJD7ugkw==
  dependencies:
    is-fullwidth-code-point "^2.0.0"
    strip-ansi "^4.0.0"

string-width@^3.0.0, string-width@^3.1.0:
  version "3.1.0"
  resolved "https://registry.yarnpkg.com/string-width/-/string-width-3.1.0.tgz#22767be21b62af1081574306f69ac51b62203961"
  integrity sha512-vafcv6KjVZKSgz06oM/H6GDBrAtz8vdhQakGjFIvNrHA6y3HCF1CInLy+QLq8dTJPQ1b+KDUqDFctkdRW44e1w==
  dependencies:
    emoji-regex "^7.0.1"
    is-fullwidth-code-point "^2.0.0"
    strip-ansi "^5.1.0"

string-width@^4.1.0:
  version "4.2.0"
  resolved "https://registry.yarnpkg.com/string-width/-/string-width-4.2.0.tgz#952182c46cc7b2c313d1596e623992bd163b72b5"
  integrity sha512-zUz5JD+tgqtuDjMhwIg5uFVV3dtqZ9yQJlZVfq4I01/K5Paj5UHj7VyrQOJvzawSVlKpObApbfD0Ed6yJc+1eg==
  dependencies:
    emoji-regex "^8.0.0"
    is-fullwidth-code-point "^3.0.0"
    strip-ansi "^6.0.0"

string.prototype.matchall@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/string.prototype.matchall/-/string.prototype.matchall-4.0.2.tgz#48bb510326fb9fdeb6a33ceaa81a6ea04ef7648e"
  integrity sha512-N/jp6O5fMf9os0JU3E72Qhf590RSRZU/ungsL/qJUYVTNv7hTG0P/dbPjxINVN9jpscu3nzYwKESU3P3RY5tOg==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.0"
    has-symbols "^1.0.1"
    internal-slot "^1.0.2"
    regexp.prototype.flags "^1.3.0"
    side-channel "^1.0.2"

string.prototype.trimleft@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/string.prototype.trimleft/-/string.prototype.trimleft-2.1.1.tgz#9bdb8ac6abd6d602b17a4ed321870d2f8dcefc74"
  integrity sha512-iu2AGd3PuP5Rp7x2kEZCrB2Nf41ehzh+goo8TV7z8/XDBbsvc6HQIlUl9RjkZ4oyrW1XM5UwlGl1oVEaDjg6Ag==
  dependencies:
    define-properties "^1.1.3"
    function-bind "^1.1.1"

string.prototype.trimright@^2.1.1:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/string.prototype.trimright/-/string.prototype.trimright-2.1.1.tgz#440314b15996c866ce8a0341894d45186200c5d9"
  integrity sha512-qFvWL3/+QIgZXVmJBfpHmxLB7xsUXz6HsUmP8+5dRaC3Q7oKUv9Vo6aMCRZC1smrtyECFsIT30PqBJ1gTjAs+g==
  dependencies:
    define-properties "^1.1.3"
    function-bind "^1.1.1"

string_decoder@^1.0.0, string_decoder@^1.1.1:
  version "1.3.0"
  resolved "https://registry.yarnpkg.com/string_decoder/-/string_decoder-1.3.0.tgz#42f114594a46cf1a8e30b0a84f56c78c3edac21e"
  integrity sha512-hkRX8U1WjJFd8LsDJ2yQ/wWWxaopEsABU1XfkM8A+j0+85JAGppt16cr1Whg6KIbb4okU6Mql6BOj+uup/wKeA==
  dependencies:
    safe-buffer "~5.2.0"

string_decoder@~1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/string_decoder/-/string_decoder-1.1.1.tgz#9cf1611ba62685d7030ae9e4ba34149c3af03fc8"
  integrity sha512-n/ShnvDi6FHbbVfviro+WojiFzv+s8MPMHBczVePfUpDJLwoLT0ht1l4YwBCbi8pJAveEEdnkHyPyTP/mzRfwg==
  dependencies:
    safe-buffer "~5.1.0"

stringify-object@^3.3.0:
  version "3.3.0"
  resolved "https://registry.yarnpkg.com/stringify-object/-/stringify-object-3.3.0.tgz#703065aefca19300d3ce88af4f5b3956d7556629"
  integrity sha512-rHqiFh1elqCQ9WPLIC8I0Q/g/wj5J1eMkyoiD6eoQApWHP0FtlK7rqnhmabL5VUY9JQCcqwwvlOaSuutekgyrw==
  dependencies:
    get-own-enumerable-property-symbols "^3.0.0"
    is-obj "^1.0.1"
    is-regexp "^1.0.0"

strip-ansi@6.0.0, strip-ansi@^6.0.0:
  version "6.0.0"
  resolved "https://registry.yarnpkg.com/strip-ansi/-/strip-ansi-6.0.0.tgz#0b1571dd7669ccd4f3e06e14ef1eed26225ae532"
  integrity sha512-AuvKTrTfQNYNIctbR1K/YGTR1756GycPsg7b9bdV9Duqur4gv6aKqHXah67Z8ImS7WEz5QVcOtlfW2rZEugt6w==
  dependencies:
    ansi-regex "^5.0.0"

strip-ansi@^3.0.0, strip-ansi@^3.0.1:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/strip-ansi/-/strip-ansi-3.0.1.tgz#6a385fb8853d952d5ff05d0e8aaf94278dc63dcf"
  integrity sha1-ajhfuIU9lS1f8F0Oiq+UJ43GPc8=
  dependencies:
    ansi-regex "^2.0.0"

strip-ansi@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/strip-ansi/-/strip-ansi-4.0.0.tgz#a8479022eb1ac368a871389b635262c505ee368f"
  integrity sha1-qEeQIusaw2iocTibY1JixQXuNo8=
  dependencies:
    ansi-regex "^3.0.0"

strip-ansi@^5.0.0, strip-ansi@^5.1.0, strip-ansi@^5.2.0:
  version "5.2.0"
  resolved "https://registry.yarnpkg.com/strip-ansi/-/strip-ansi-5.2.0.tgz#8c9a536feb6afc962bdfa5b104a5091c1ad9c0ae"
  integrity sha512-DuRs1gKbBqsMKIZlrffwlug8MHkcnpjs5VPmL1PAh+mA30U0DTotfDZ0d2UUsXpPmPmMMJ6W773MaA3J+lbiWA==
  dependencies:
    ansi-regex "^4.1.0"

strip-bom@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/strip-bom/-/strip-bom-3.0.0.tgz#2334c18e9c759f7bdd56fdef7e9ae3d588e68ed3"
  integrity sha1-IzTBjpx1n3vdVv3vfprj1YjmjtM=

strip-comments@^1.0.2:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/strip-comments/-/strip-comments-1.0.2.tgz#82b9c45e7f05873bee53f37168af930aa368679d"
  integrity sha512-kL97alc47hoyIQSV165tTt9rG5dn4w1dNnBhOQ3bOU1Nc1hel09jnXANaHJ7vzHLd4Ju8kseDGzlev96pghLFw==
  dependencies:
    babel-extract-comments "^1.0.0"
    babel-plugin-transform-object-rest-spread "^6.26.0"

strip-eof@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/strip-eof/-/strip-eof-1.0.0.tgz#bb43ff5598a6eb05d89b59fcd129c983313606bf"
  integrity sha1-u0P/VZim6wXYm1n80SnJgzE2Br8=

strip-indent@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/strip-indent/-/strip-indent-3.0.0.tgz#c32e1cee940b6b3432c771bc2c54bcce73cd3001"
  integrity sha512-laJTa3Jb+VQpaC6DseHhF7dXVqHTfJPCRDaEbid/drOhgitgYku/letMUqOXFoWV0zIIUbjpdH2t+tYj4bQMRQ==
  dependencies:
    min-indent "^1.0.0"

strip-json-comments@^3.0.1:
  version "3.0.1"
  resolved "https://registry.yarnpkg.com/strip-json-comments/-/strip-json-comments-3.0.1.tgz#85713975a91fb87bf1b305cca77395e40d2a64a7"
  integrity sha512-VTyMAUfdm047mwKl+u79WIdrZxtFtn+nBxHeb844XBQ9uMNTuTHdx2hc5RiAJYqwTj3wc/xe5HLSdJSkJ+WfZw==

style-loader@0.23.1:
  version "0.23.1"
  resolved "https://registry.yarnpkg.com/style-loader/-/style-loader-0.23.1.tgz#cb9154606f3e771ab6c4ab637026a1049174d925"
  integrity sha512-XK+uv9kWwhZMZ1y7mysB+zoihsEj4wneFWAS5qoiLwzW0WzSqMrrsIy+a3zkQJq0ipFtBpX5W3MqyRIBF/WFGg==
  dependencies:
    loader-utils "^1.1.0"
    schema-utils "^1.0.0"

stylehacks@^4.0.0:
  version "4.0.3"
  resolved "https://registry.yarnpkg.com/stylehacks/-/stylehacks-4.0.3.tgz#6718fcaf4d1e07d8a1318690881e8d96726a71d5"
  integrity sha512-7GlLk9JwlElY4Y6a/rmbH2MhVlTyVmiJd1PfTCqFaIBEGMYNsrO/v3SeGTdhBThLg4Z+NbOk/qFMwCa+J+3p/g==
  dependencies:
    browserslist "^4.0.0"
    postcss "^7.0.0"
    postcss-selector-parser "^3.0.0"

supports-color@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-2.0.0.tgz#535d045ce6b6363fa40117084629995e9df324c7"
  integrity sha1-U10EXOa2Nj+kARcIRimZXp3zJMc=

supports-color@^5.3.0:
  version "5.5.0"
  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-5.5.0.tgz#e2e69a44ac8772f78a1ec0b35b689df6530efc8f"
  integrity sha512-QjVjwdXIt408MIiAqCX4oUKsgU2EqAGzs2Ppkm4aQYbjm+ZEWEcW4SfFNTr4uMNZma0ey4f5lgLrkB0aX0QMow==
  dependencies:
    has-flag "^3.0.0"

supports-color@^6.1.0:
  version "6.1.0"
  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-6.1.0.tgz#0764abc69c63d5ac842dd4867e8d025e880df8f3"
  integrity sha512-qe1jfm1Mg7Nq/NSh6XE24gPXROEVsWHxC1LIx//XNlD9iw7YZQGjZNjYN7xGaEG6iKdA8EtNFW6R0gjnVXp+wQ==
  dependencies:
    has-flag "^3.0.0"

supports-color@^7.0.0, supports-color@^7.1.0:
  version "7.1.0"
  resolved "https://registry.yarnpkg.com/supports-color/-/supports-color-7.1.0.tgz#68e32591df73e25ad1c4b49108a2ec507962bfd1"
  integrity sha512-oRSIpR8pxT1Wr2FquTNnGet79b3BWljqOuoW/h4oBhxJ/HUbX5nX6JSruTkvXDCFMwDPvsaTTbvMLKZWSy0R5g==
  dependencies:
    has-flag "^4.0.0"

svg-parser@^2.0.0:
  version "2.0.4"
  resolved "https://registry.yarnpkg.com/svg-parser/-/svg-parser-2.0.4.tgz#fdc2e29e13951736140b76cb122c8ee6630eb6b5"
  integrity sha512-e4hG1hRwoOdRb37cIMSgzNsxyzKfayW6VOflrwvR+/bzrkyxY/31WkbgnQpgtrNp1SdpJvpUAGTa/ZoiPNDuRQ==

svgo@^1.0.0, svgo@^1.2.2:
  version "1.3.2"
  resolved "https://registry.yarnpkg.com/svgo/-/svgo-1.3.2.tgz#b6dc511c063346c9e415b81e43401145b96d4167"
  integrity sha512-yhy/sQYxR5BkC98CY7o31VGsg014AKLEPxdfhora76l36hD9Rdy5NZA/Ocn6yayNPgSamYdtX2rFJdcv07AYVw==
  dependencies:
    chalk "^2.4.1"
    coa "^2.0.2"
    css-select "^2.0.0"
    css-select-base-adapter "^0.1.1"
    css-tree "1.0.0-alpha.37"
    csso "^4.0.2"
    js-yaml "^3.13.1"
    mkdirp "~0.5.1"
    object.values "^1.1.0"
    sax "~1.2.4"
    stable "^0.1.8"
    unquote "~1.1.1"
    util.promisify "~1.0.0"

symbol-tree@^3.2.2:
  version "3.2.4"
  resolved "https://registry.yarnpkg.com/symbol-tree/-/symbol-tree-3.2.4.tgz#430637d248ba77e078883951fb9aa0eed7c63fa2"
  integrity sha512-9QNk5KwDF+Bvz+PyObkmSYjI5ksVUYtjW7AU22r2NKcfLJcXp96hkDWU3+XndOsUb+AQ9QhfzfCT2O+CNWT5Tw==

table@^5.2.3:
  version "5.4.6"
  resolved "https://registry.yarnpkg.com/table/-/table-5.4.6.tgz#1292d19500ce3f86053b05f0e8e7e4a3bb21079e"
  integrity sha512-wmEc8m4fjnob4gt5riFRtTu/6+4rSe12TpAELNSqHMfF3IqnA+CH37USM6/YR3qRZv7e56kAEAtd6nKZaxe0Ug==
  dependencies:
    ajv "^6.10.2"
    lodash "^4.17.14"
    slice-ansi "^2.1.0"
    string-width "^3.0.0"

tapable@^1.0.0, tapable@^1.1.3:
  version "1.1.3"
  resolved "https://registry.yarnpkg.com/tapable/-/tapable-1.1.3.tgz#a1fccc06b58db61fd7a45da2da44f5f3a3e67ba2"
  integrity sha512-4WK/bYZmj8xLr+HUCODHGF1ZFzsYffasLUgEiMBY4fgtltdO6B4WJtlSbPaDTLpYTcGVwM2qLnFTICEcNxs3kA==

terser-webpack-plugin@2.3.5:
  version "2.3.5"
  resolved "https://registry.yarnpkg.com/terser-webpack-plugin/-/terser-webpack-plugin-2.3.5.tgz#5ad971acce5c517440ba873ea4f09687de2f4a81"
  integrity sha512-WlWksUoq+E4+JlJ+h+U+QUzXpcsMSSNXkDy9lBVkSqDn1w23Gg29L/ary9GeJVYCGiNJJX7LnVc4bwL1N3/g1w==
  dependencies:
    cacache "^13.0.1"
    find-cache-dir "^3.2.0"
    jest-worker "^25.1.0"
    p-limit "^2.2.2"
    schema-utils "^2.6.4"
    serialize-javascript "^2.1.2"
    source-map "^0.6.1"
    terser "^4.4.3"
    webpack-sources "^1.4.3"

terser-webpack-plugin@^1.4.3:
  version "1.4.3"
  resolved "https://registry.yarnpkg.com/terser-webpack-plugin/-/terser-webpack-plugin-1.4.3.tgz#5ecaf2dbdc5fb99745fd06791f46fc9ddb1c9a7c"
  integrity sha512-QMxecFz/gHQwteWwSo5nTc6UaICqN1bMedC5sMtUc7y3Ha3Q8y6ZO0iCR8pq4RJC8Hjf0FEPEHZqcMB/+DFCrA==
  dependencies:
    cacache "^12.0.2"
    find-cache-dir "^2.1.0"
    is-wsl "^1.1.0"
    schema-utils "^1.0.0"
    serialize-javascript "^2.1.2"
    source-map "^0.6.1"
    terser "^4.1.2"
    webpack-sources "^1.4.0"
    worker-farm "^1.7.0"

terser@^4.1.2, terser@^4.4.3, terser@^4.6.3:
  version "4.6.7"
  resolved "https://registry.yarnpkg.com/terser/-/terser-4.6.7.tgz#478d7f9394ec1907f0e488c5f6a6a9a2bad55e72"
  integrity sha512-fmr7M1f7DBly5cX2+rFDvmGBAaaZyPrHYK4mMdHEDAdNTqXSZgSOfqsfGq2HqPGT/1V0foZZuCZFx8CHKgAk3g==
  dependencies:
    commander "^2.20.0"
    source-map "~0.6.1"
    source-map-support "~0.5.12"

test-exclude@^5.2.3:
  version "5.2.3"
  resolved "https://registry.yarnpkg.com/test-exclude/-/test-exclude-5.2.3.tgz#c3d3e1e311eb7ee405e092dac10aefd09091eac0"
  integrity sha512-M+oxtseCFO3EDtAaGH7iiej3CBkzXqFMbzqYAACdzKui4eZA+pq3tZEwChvOdNfa7xxy8BfbmgJSIr43cC/+2g==
  dependencies:
    glob "^7.1.3"
    minimatch "^3.0.4"
    read-pkg-up "^4.0.0"
    require-main-filename "^2.0.0"

text-table@0.2.0, text-table@^0.2.0:
  version "0.2.0"
  resolved "https://registry.yarnpkg.com/text-table/-/text-table-0.2.0.tgz#7f5ee823ae805207c00af2df4a84ec3fcfa570b4"
  integrity sha1-f17oI66AUgfACvLfSoTsP8+lcLQ=

throat@^4.0.0:
  version "4.1.0"
  resolved "https://registry.yarnpkg.com/throat/-/throat-4.1.0.tgz#89037cbc92c56ab18926e6ba4cbb200e15672a6a"
  integrity sha1-iQN8vJLFarGJJua6TLsgDhVnKmo=

through2@^2.0.0:
  version "2.0.5"
  resolved "https://registry.yarnpkg.com/through2/-/through2-2.0.5.tgz#01c1e39eb31d07cb7d03a96a70823260b23132cd"
  integrity sha512-/mrRod8xqpA+IHSLyGCQ2s8SPHiCDEeQJSep1jqLYeEUClOFG2Qsh+4FU6G9VeqpZnGW/Su8LQGc4YKni5rYSQ==
  dependencies:
    readable-stream "~2.3.6"
    xtend "~4.0.1"

through@^2.3.6:
  version "2.3.8"
  resolved "https://registry.yarnpkg.com/through/-/through-2.3.8.tgz#0dd4c9ffaabc357960b1b724115d7e0e86a2e1f5"
  integrity sha1-DdTJ/6q8NXlgsbckEV1+Doai4fU=

thunky@^1.0.2:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/thunky/-/thunky-1.1.0.tgz#5abaf714a9405db0504732bbccd2cedd9ef9537d"
  integrity sha512-eHY7nBftgThBqOyHGVN+l8gF0BucP09fMo0oO/Lb0w1OF80dJv+lDVpXG60WMQvkcxAkNybKsrEIE3ZtKGmPrA==

timers-browserify@^2.0.4:
  version "2.0.11"
  resolved "https://registry.yarnpkg.com/timers-browserify/-/timers-browserify-2.0.11.tgz#800b1f3eee272e5bc53ee465a04d0e804c31211f"
  integrity sha512-60aV6sgJ5YEbzUdn9c8kYGIqOubPoUdqQCul3SBAsRCZ40s6Y5cMcrW4dt3/k/EsbLVJNl9n6Vz3fTc+k2GeKQ==
  dependencies:
    setimmediate "^1.0.4"

timsort@^0.3.0:
  version "0.3.0"
  resolved "https://registry.yarnpkg.com/timsort/-/timsort-0.3.0.tgz#405411a8e7e6339fe64db9a234de11dc31e02bd4"
  integrity sha1-QFQRqOfmM5/mTbmiNN4R3DHgK9Q=

tmp@^0.0.33:
  version "0.0.33"
  resolved "https://registry.yarnpkg.com/tmp/-/tmp-0.0.33.tgz#6d34335889768d21b2bcda0aa277ced3b1bfadf9"
  integrity sha512-jRCJlojKnZ3addtTOjdIqoRuPEKBvNXcGYqzO6zWZX8KfKEpnGY5jfggJQ3EjKuu8D4bJRr0y+cYJFmYbImXGw==
  dependencies:
    os-tmpdir "~1.0.2"

tmpl@1.0.x:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/tmpl/-/tmpl-1.0.4.tgz#23640dd7b42d00433911140820e5cf440e521dd1"
  integrity sha1-I2QN17QtAEM5ERQIIOXPRA5SHdE=

to-arraybuffer@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/to-arraybuffer/-/to-arraybuffer-1.0.1.tgz#7d229b1fcc637e466ca081180836a7aabff83f43"
  integrity sha1-fSKbH8xjfkZsoIEYCDanqr/4P0M=

to-fast-properties@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/to-fast-properties/-/to-fast-properties-2.0.0.tgz#dc5e698cbd079265bc73e0377681a4e4e83f616e"
  integrity sha1-3F5pjL0HkmW8c+A3doGk5Og/YW4=

to-object-path@^0.3.0:
  version "0.3.0"
  resolved "https://registry.yarnpkg.com/to-object-path/-/to-object-path-0.3.0.tgz#297588b7b0e7e0ac08e04e672f85c1f4999e17af"
  integrity sha1-KXWIt7Dn4KwI4E5nL4XB9JmeF68=
  dependencies:
    kind-of "^3.0.2"

to-regex-range@^2.1.0:
  version "2.1.1"
  resolved "https://registry.yarnpkg.com/to-regex-range/-/to-regex-range-2.1.1.tgz#7c80c17b9dfebe599e27367e0d4dd5590141db38"
  integrity sha1-fIDBe53+vlmeJzZ+DU3VWQFB2zg=
  dependencies:
    is-number "^3.0.0"
    repeat-string "^1.6.1"

to-regex-range@^5.0.1:
  version "5.0.1"
  resolved "https://registry.yarnpkg.com/to-regex-range/-/to-regex-range-5.0.1.tgz#1648c44aae7c8d988a326018ed72f5b4dd0392e4"
  integrity sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==
  dependencies:
    is-number "^7.0.0"

to-regex@^3.0.1, to-regex@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/to-regex/-/to-regex-3.0.2.tgz#13cfdd9b336552f30b51f33a8ae1b42a7a7599ce"
  integrity sha512-FWtleNAtZ/Ki2qtqej2CXTOayOH9bHDQF+Q48VpWyDXjbYxA4Yz8iDB31zXOBUlOHHKidDbqGVrTUvQMPmBGBw==
  dependencies:
    define-property "^2.0.2"
    extend-shallow "^3.0.2"
    regex-not "^1.0.2"
    safe-regex "^1.1.0"

toidentifier@1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/toidentifier/-/toidentifier-1.0.0.tgz#7e1be3470f1e77948bc43d94a3c8f4d7752ba553"
  integrity sha512-yaOH/Pk/VEhBWWTlhI+qXxDFXlejDGcQipMlyxda9nthulaxLZUNcUqFxokp0vcYnvteJln5FNQDRrxj3YcbVw==

tough-cookie@^2.3.3, tough-cookie@^2.3.4, tough-cookie@^2.5.0, tough-cookie@~2.5.0:
  version "2.5.0"
  resolved "https://registry.yarnpkg.com/tough-cookie/-/tough-cookie-2.5.0.tgz#cd9fb2a0aa1d5a12b473bd9fb96fa3dcff65ade2"
  integrity sha512-nlLsUzgm1kfLXSXfRZMc1KLAugd4hqJHDTvc2hDIwS3mZAfMEuMbc03SujMF+GEcpaX/qboeycw6iO8JwVv2+g==
  dependencies:
    psl "^1.1.28"
    punycode "^2.1.1"

tr46@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/tr46/-/tr46-1.0.1.tgz#a8b13fd6bfd2489519674ccde55ba3693b706d09"
  integrity sha1-qLE/1r/SSJUZZ0zN5VujaTtwbQk=
  dependencies:
    punycode "^2.1.0"

ts-pnp@1.1.6, ts-pnp@^1.1.6:
  version "1.1.6"
  resolved "https://registry.yarnpkg.com/ts-pnp/-/ts-pnp-1.1.6.tgz#389a24396d425a0d3162e96d2b4638900fdc289a"
  integrity sha512-CrG5GqAAzMT7144Cl+UIFP7mz/iIhiy+xQ6GGcnjTezhALT02uPMRw7tgDSESgB5MsfKt55+GPWw4ir1kVtMIQ==

tslib@^1.10.0, tslib@^1.8.1, tslib@^1.9.0:
  version "1.11.1"
  resolved "https://registry.yarnpkg.com/tslib/-/tslib-1.11.1.tgz#eb15d128827fbee2841549e171f45ed338ac7e35"
  integrity sha512-aZW88SY8kQbU7gpV19lN24LtXh/yD4ZZg6qieAJDDg+YBsJcSmLGK9QpnUjAKVG/xefmvJGd1WUmfpT/g6AJGA==

tsutils@^3.17.1:
  version "3.17.1"
  resolved "https://registry.yarnpkg.com/tsutils/-/tsutils-3.17.1.tgz#ed719917f11ca0dee586272b2ac49e015a2dd759"
  integrity sha512-kzeQ5B8H3w60nFY2g8cJIuH7JDpsALXySGtwGJ0p2LSjLgay3NdIpqq5SoOBe46bKDW2iq25irHCr8wjomUS2g==
  dependencies:
    tslib "^1.8.1"

tty-browserify@0.0.0:
  version "0.0.0"
  resolved "https://registry.yarnpkg.com/tty-browserify/-/tty-browserify-0.0.0.tgz#a157ba402da24e9bf957f9aa69d524eed42901a6"
  integrity sha1-oVe6QC2iTpv5V/mqadUk7tQpAaY=

tunnel-agent@^0.6.0:
  version "0.6.0"
  resolved "https://registry.yarnpkg.com/tunnel-agent/-/tunnel-agent-0.6.0.tgz#27a5dea06b36b04a0a9966774b290868f0fc40fd"
  integrity sha1-J6XeoGs2sEoKmWZ3SykIaPD8QP0=
  dependencies:
    safe-buffer "^5.0.1"

tweetnacl@^0.14.3, tweetnacl@~0.14.0:
  version "0.14.5"
  resolved "https://registry.yarnpkg.com/tweetnacl/-/tweetnacl-0.14.5.tgz#5ae68177f192d4456269d108afa93ff8743f4f64"
  integrity sha1-WuaBd/GS1EViadEIr6k/+HQ/T2Q=

type-check@~0.3.2:
  version "0.3.2"
  resolved "https://registry.yarnpkg.com/type-check/-/type-check-0.3.2.tgz#5884cab512cf1d355e3fb784f30804b2b520db72"
  integrity sha1-WITKtRLPHTVeP7eE8wgEsrUg23I=
  dependencies:
    prelude-ls "~1.1.2"

type-fest@^0.11.0:
  version "0.11.0"
  resolved "https://registry.yarnpkg.com/type-fest/-/type-fest-0.11.0.tgz#97abf0872310fed88a5c466b25681576145e33f1"
  integrity sha512-OdjXJxnCN1AvyLSzeKIgXTXxV+99ZuXl3Hpo9XpJAv9MBcHrrJOQ5kV7ypXOuQie+AmWG25hLbiKdwYTifzcfQ==

type-fest@^0.8.1:
  version "0.8.1"
  resolved "https://registry.yarnpkg.com/type-fest/-/type-fest-0.8.1.tgz#09e249ebde851d3b1e48d27c105444667f17b83d"
  integrity sha512-4dbzIzqvjtgiM5rw1k5rEHtBANKmdudhGyBEajN01fEyhaAIhsoKNy6y7+IN93IfpFtwY9iqi7kD+xwKhQsNJA==

type-is@~1.6.17, type-is@~1.6.18:
  version "1.6.18"
  resolved "https://registry.yarnpkg.com/type-is/-/type-is-1.6.18.tgz#4e552cd05df09467dcbc4ef739de89f2cf37c131"
  integrity sha512-TkRKr9sUTxEH8MdfuCSP7VizJyzRNMjj2J2do2Jr3Kym598JVdEksuzPQCnlFPW4ky9Q+iA+ma9BGm06XQBy8g==
  dependencies:
    media-typer "0.3.0"
    mime-types "~2.1.24"

type@^1.0.1:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/type/-/type-1.2.0.tgz#848dd7698dafa3e54a6c479e759c4bc3f18847a0"
  integrity sha512-+5nt5AAniqsCnu2cEQQdpzCAh33kVx8n0VoFidKpB1dVVLAN/F+bgVOqOJqOnEnrhp222clB5p3vUlD+1QAnfg==

type@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/type/-/type-2.0.0.tgz#5f16ff6ef2eb44f260494dae271033b29c09a9c3"
  integrity sha512-KBt58xCHry4Cejnc2ISQAF7QY+ORngsWfxezO68+12hKV6lQY8P/psIkcbjeHWn7MqcgciWJyCCevFMJdIXpow==

typedarray@^0.0.6:
  version "0.0.6"
  resolved "https://registry.yarnpkg.com/typedarray/-/typedarray-0.0.6.tgz#867ac74e3864187b1d3d47d996a78ec5c8830777"
  integrity sha1-hnrHTjhkGHsdPUfZlqeOxciDB3c=

unicode-canonical-property-names-ecmascript@^1.0.4:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/unicode-canonical-property-names-ecmascript/-/unicode-canonical-property-names-ecmascript-1.0.4.tgz#2619800c4c825800efdd8343af7dd9933cbe2818"
  integrity sha512-jDrNnXWHd4oHiTZnx/ZG7gtUTVp+gCcTTKr8L0HjlwphROEW3+Him+IpvC+xcJEFegapiMZyZe02CyuOnRmbnQ==

unicode-match-property-ecmascript@^1.0.4:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/unicode-match-property-ecmascript/-/unicode-match-property-ecmascript-1.0.4.tgz#8ed2a32569961bce9227d09cd3ffbb8fed5f020c"
  integrity sha512-L4Qoh15vTfntsn4P1zqnHulG0LdXgjSO035fEpdtp6YxXhMT51Q6vgM5lYdG/5X3MjS+k/Y9Xw4SFCY9IkR0rg==
  dependencies:
    unicode-canonical-property-names-ecmascript "^1.0.4"
    unicode-property-aliases-ecmascript "^1.0.4"

unicode-match-property-value-ecmascript@^1.2.0:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/unicode-match-property-value-ecmascript/-/unicode-match-property-value-ecmascript-1.2.0.tgz#0d91f600eeeb3096aa962b1d6fc88876e64ea531"
  integrity sha512-wjuQHGQVofmSJv1uVISKLE5zO2rNGzM/KCYZch/QQvez7C1hUhBIuZ701fYXExuufJFMPhv2SyL8CyoIfMLbIQ==

unicode-property-aliases-ecmascript@^1.0.4:
  version "1.1.0"
  resolved "https://registry.yarnpkg.com/unicode-property-aliases-ecmascript/-/unicode-property-aliases-ecmascript-1.1.0.tgz#dd57a99f6207bedff4628abefb94c50db941c8f4"
  integrity sha512-PqSoPh/pWetQ2phoj5RLiaqIk4kCNwoV3CI+LfGmWLKI3rE3kl1h59XpX2BjgDrmbxD9ARtQobPGU1SguCYuQg==

union-value@^1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/union-value/-/union-value-1.0.1.tgz#0b6fe7b835aecda61c6ea4d4f02c14221e109847"
  integrity sha512-tJfXmxMeWYnczCVs7XAEvIV7ieppALdyepWMkHkwciRpZraG/xwT+s2JN8+pr1+8jCRf80FFzvr+MpQeeoF4Xg==
  dependencies:
    arr-union "^3.1.0"
    get-value "^2.0.6"
    is-extendable "^0.1.1"
    set-value "^2.0.1"

uniq@^1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/uniq/-/uniq-1.0.1.tgz#b31c5ae8254844a3a8281541ce2b04b865a734ff"
  integrity sha1-sxxa6CVIRKOoKBVBzisEuGWnNP8=

uniqs@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/uniqs/-/uniqs-2.0.0.tgz#ffede4b36b25290696e6e165d4a59edb998e6b02"
  integrity sha1-/+3ks2slKQaW5uFl1KWe25mOawI=

unique-filename@^1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/unique-filename/-/unique-filename-1.1.1.tgz#1d69769369ada0583103a1e6ae87681b56573230"
  integrity sha512-Vmp0jIp2ln35UTXuryvjzkjGdRyf9b2lTXuSYUiPmzRcl3FDtYqAwOnTJkAngD9SWhnoJzDbTKwaOrZ+STtxNQ==
  dependencies:
    unique-slug "^2.0.0"

unique-slug@^2.0.0:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/unique-slug/-/unique-slug-2.0.2.tgz#baabce91083fc64e945b0f3ad613e264f7cd4e6c"
  integrity sha512-zoWr9ObaxALD3DOPfjPSqxt4fnZiWblxHIgeWqW8x7UqDzEtHEQLzji2cuJYQFCU6KmoJikOYAZlrTHHebjx2w==
  dependencies:
    imurmurhash "^0.1.4"

universalify@^0.1.0:
  version "0.1.2"
  resolved "https://registry.yarnpkg.com/universalify/-/universalify-0.1.2.tgz#b646f69be3942dabcecc9d6639c80dc105efaa66"
  integrity sha512-rBJeI5CXAlmy1pV+617WB9J63U6XcazHHF2f2dbJix4XzpUF0RS3Zbj0FGIOCAva5P/d/GBOYaACQ1w+0azUkg==

unpipe@1.0.0, unpipe@~1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/unpipe/-/unpipe-1.0.0.tgz#b2bf4ee8514aae6165b4817829d21b2ef49904ec"
  integrity sha1-sr9O6FFKrmFltIF4KdIbLvSZBOw=

unquote@~1.1.1:
  version "1.1.1"
  resolved "https://registry.yarnpkg.com/unquote/-/unquote-1.1.1.tgz#8fded7324ec6e88a0ff8b905e7c098cdc086d544"
  integrity sha1-j97XMk7G6IoP+LkF58CYzcCG1UQ=

unset-value@^1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/unset-value/-/unset-value-1.0.0.tgz#8376873f7d2335179ffb1e6fc3a8ed0dfc8ab559"
  integrity sha1-g3aHP30jNRef+x5vw6jtDfyKtVk=
  dependencies:
    has-value "^0.3.1"
    isobject "^3.0.0"

upath@^1.1.1:
  version "1.2.0"
  resolved "https://registry.yarnpkg.com/upath/-/upath-1.2.0.tgz#8f66dbcd55a883acdae4408af8b035a5044c1894"
  integrity sha512-aZwGpamFO61g3OlfT7OQCHqhGnW43ieH9WZeP7QxN/G/jS4jfqUkZxoryvJgVPEcrl5NL/ggHsSmLMHuH64Lhg==

uri-js@^4.2.2:
  version "4.2.2"
  resolved "https://registry.yarnpkg.com/uri-js/-/uri-js-4.2.2.tgz#94c540e1ff772956e2299507c010aea6c8838eb0"
  integrity sha512-KY9Frmirql91X2Qgjry0Wd4Y+YTdrdZheS8TFwvkbLWf/G5KNJDCh6pKL5OZctEW4+0Baa5idK2ZQuELRwPznQ==
  dependencies:
    punycode "^2.1.0"

urix@^0.1.0:
  version "0.1.0"
  resolved "https://registry.yarnpkg.com/urix/-/urix-0.1.0.tgz#da937f7a62e21fec1fd18d49b35c2935067a6c72"
  integrity sha1-2pN/emLiH+wf0Y1Js1wpNQZ6bHI=

url-loader@2.3.0:
  version "2.3.0"
  resolved "https://registry.yarnpkg.com/url-loader/-/url-loader-2.3.0.tgz#e0e2ef658f003efb8ca41b0f3ffbf76bab88658b"
  integrity sha512-goSdg8VY+7nPZKUEChZSEtW5gjbS66USIGCeSJ1OVOJ7Yfuh/36YxCwMi5HVEJh6mqUYOoy3NJ0vlOMrWsSHog==
  dependencies:
    loader-utils "^1.2.3"
    mime "^2.4.4"
    schema-utils "^2.5.0"

url-parse@^1.4.3:
  version "1.4.7"
  resolved "https://registry.yarnpkg.com/url-parse/-/url-parse-1.4.7.tgz#a8a83535e8c00a316e403a5db4ac1b9b853ae278"
  integrity sha512-d3uaVyzDB9tQoSXFvuSUNFibTd9zxd2bkVrDRvF5TmvWWQwqE4lgYJ5m+x1DbecWkw+LK4RNl2CU1hHuOKPVlg==
  dependencies:
    querystringify "^2.1.1"
    requires-port "^1.0.0"

url@^0.11.0:
  version "0.11.0"
  resolved "https://registry.yarnpkg.com/url/-/url-0.11.0.tgz#3838e97cfc60521eb73c525a8e55bfdd9e2e28f1"
  integrity sha1-ODjpfPxgUh63PFJajlW/3Z4uKPE=
  dependencies:
    punycode "1.3.2"
    querystring "0.2.0"

use@^3.1.0:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/use/-/use-3.1.1.tgz#d50c8cac79a19fbc20f2911f56eb973f4e10070f"
  integrity sha512-cwESVXlO3url9YWlFW/TA9cshCEhtu7IKJ/p5soJ/gGpj7vbvFrAY/eIioQ6Dw23KjZhYgiIo8HOs1nQ2vr/oQ==

util-deprecate@^1.0.1, util-deprecate@~1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/util-deprecate/-/util-deprecate-1.0.2.tgz#450d4dc9fa70de732762fbd2d4a28981419a0ccf"
  integrity sha1-RQ1Nyfpw3nMnYvvS1KKJgUGaDM8=

util.promisify@1.0.0:
  version "1.0.0"
  resolved "https://registry.yarnpkg.com/util.promisify/-/util.promisify-1.0.0.tgz#440f7165a459c9a16dc145eb8e72f35687097030"
  integrity sha512-i+6qA2MPhvoKLuxnJNpXAGhg7HphQOSUq2LKMZD0m15EiskXUkMvKdF4Uui0WYeCUGea+o2cw/ZuwehtfsrNkA==
  dependencies:
    define-properties "^1.1.2"
    object.getownpropertydescriptors "^2.0.3"

util.promisify@^1.0.0, util.promisify@~1.0.0:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/util.promisify/-/util.promisify-1.0.1.tgz#6baf7774b80eeb0f7520d8b81d07982a59abbaee"
  integrity sha512-g9JpC/3He3bm38zsLupWryXHoEcS22YHthuPQSJdMy6KNrzIRzWqcsHzD/WUnqe45whVou4VIsPew37DoXWNrA==
  dependencies:
    define-properties "^1.1.3"
    es-abstract "^1.17.2"
    has-symbols "^1.0.1"
    object.getownpropertydescriptors "^2.1.0"

util@0.10.3:
  version "0.10.3"
  resolved "https://registry.yarnpkg.com/util/-/util-0.10.3.tgz#7afb1afe50805246489e3db7fe0ed379336ac0f9"
  integrity sha1-evsa/lCAUkZInj23/g7TeTNqwPk=
  dependencies:
    inherits "2.0.1"

util@^0.11.0:
  version "0.11.1"
  resolved "https://registry.yarnpkg.com/util/-/util-0.11.1.tgz#3236733720ec64bb27f6e26f421aaa2e1b588d61"
  integrity sha512-HShAsny+zS2TZfaXxD9tYj4HQGlBezXZMZuM/S5PKLLoZkShZiGk9o5CzukI1LVHZvjdvZ2Sj1aW/Ndn2NB/HQ==
  dependencies:
    inherits "2.0.3"

utila@^0.4.0, utila@~0.4:
  version "0.4.0"
  resolved "https://registry.yarnpkg.com/utila/-/utila-0.4.0.tgz#8a16a05d445657a3aea5eecc5b12a4fa5379772c"
  integrity sha1-ihagXURWV6Oupe7MWxKk+lN5dyw=

utils-merge@1.0.1:
  version "1.0.1"
  resolved "https://registry.yarnpkg.com/utils-merge/-/utils-merge-1.0.1.tgz#9f95710f50a267947b2ccc124741c1028427e713"
  integrity sha1-n5VxD1CiZ5R7LMwSR0HBAoQn5xM=

uuid@^3.0.1, uuid@^3.3.2:
  version "3.4.0"
  resolved "https://registry.yarnpkg.com/uuid/-/uuid-3.4.0.tgz#b23e4358afa8a202fe7a100af1f5f883f02007ee"
  integrity sha512-HjSDRw6gZE5JMggctHBcjVak08+KEVhSIiDzFnT9S9aegmp85S/bReBVTb4QTFaRNptJ9kuYaNhnbNEOkbKb/A==

v8-compile-cache@^2.0.3:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/v8-compile-cache/-/v8-compile-cache-2.1.0.tgz#e14de37b31a6d194f5690d67efc4e7f6fc6ab30e"
  integrity sha512-usZBT3PW+LOjM25wbqIlZwPeJV+3OSz3M1k1Ws8snlW39dZyYL9lOGC5FgPVHfk0jKmjiDV8Z0mIbVQPiwFs7g==

validate-npm-package-license@^3.0.1:
  version "3.0.4"
  resolved "https://registry.yarnpkg.com/validate-npm-package-license/-/validate-npm-package-license-3.0.4.tgz#fc91f6b9c7ba15c857f4cb2c5defeec39d4f410a"
  integrity sha512-DpKm2Ui/xN7/HQKCtpZxoRWBhZ9Z0kqtygG8XCgNQ8ZlDnxuQmWhj566j8fN4Cu3/JmbhsDo7fcAJq4s9h27Ew==
  dependencies:
    spdx-correct "^3.0.0"
    spdx-expression-parse "^3.0.0"

vary@~1.1.2:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/vary/-/vary-1.1.2.tgz#2299f02c6ded30d4a5961b0b9f74524a18f634fc"
  integrity sha1-IpnwLG3tMNSllhsLn3RSShj2NPw=

vendors@^1.0.0:
  version "1.0.4"
  resolved "https://registry.yarnpkg.com/vendors/-/vendors-1.0.4.tgz#e2b800a53e7a29b93506c3cf41100d16c4c4ad8e"
  integrity sha512-/juG65kTL4Cy2su4P8HjtkTxk6VmJDiOPBufWniqQ6wknac6jNiXS9vU+hO3wgusiyqWlzTbVHi0dyJqRONg3w==

verror@1.10.0:
  version "1.10.0"
  resolved "https://registry.yarnpkg.com/verror/-/verror-1.10.0.tgz#3a105ca17053af55d6e270c1f8288682e18da400"
  integrity sha1-OhBcoXBTr1XW4nDB+CiGguGNpAA=
  dependencies:
    assert-plus "^1.0.0"
    core-util-is "1.0.2"
    extsprintf "^1.2.0"

vm-browserify@^1.0.1:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/vm-browserify/-/vm-browserify-1.1.2.tgz#78641c488b8e6ca91a75f511e7a3b32a86e5dda0"
  integrity sha512-2ham8XPWTONajOR0ohOKOHXkm3+gaBmGut3SRuu75xLd/RRaY6vqgh8NBYYk7+RW3u5AtzPQZG8F10LHkl0lAQ==

w3c-hr-time@^1.0.1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/w3c-hr-time/-/w3c-hr-time-1.0.2.tgz#0a89cdf5cc15822df9c360543676963e0cc308cd"
  integrity sha512-z8P5DvDNjKDoFIHK7q8r8lackT6l+jo/Ye3HOle7l9nICP9lf1Ci25fy9vHd0JOWewkIFzXIEig3TdKT7JQ5fQ==
  dependencies:
    browser-process-hrtime "^1.0.0"

w3c-xmlserializer@^1.1.2:
  version "1.1.2"
  resolved "https://registry.yarnpkg.com/w3c-xmlserializer/-/w3c-xmlserializer-1.1.2.tgz#30485ca7d70a6fd052420a3d12fd90e6339ce794"
  integrity sha512-p10l/ayESzrBMYWRID6xbuCKh2Fp77+sA0doRuGn4tTIMrrZVeqfpKjXHY+oDh3K4nLdPgNwMTVP6Vp4pvqbNg==
  dependencies:
    domexception "^1.0.1"
    webidl-conversions "^4.0.2"
    xml-name-validator "^3.0.0"

wait-for-expect@^3.0.2:
  version "3.0.2"
  resolved "https://registry.yarnpkg.com/wait-for-expect/-/wait-for-expect-3.0.2.tgz#d2f14b2f7b778c9b82144109c8fa89ceaadaa463"
  integrity sha512-cfS1+DZxuav1aBYbaO/kE06EOS8yRw7qOFoD3XtjTkYvCvh3zUvNST8DXK/nPaeqIzIv3P3kL3lRJn8iwOiSag==

walker@^1.0.7, walker@~1.0.5:
  version "1.0.7"
  resolved "https://registry.yarnpkg.com/walker/-/walker-1.0.7.tgz#2f7f9b8fd10d677262b18a884e28d19618e028fb"
  integrity sha1-L3+bj9ENZ3JisYqITijRlhjgKPs=
  dependencies:
    makeerror "1.0.x"

watchpack@^1.6.0:
  version "1.6.0"
  resolved "https://registry.yarnpkg.com/watchpack/-/watchpack-1.6.0.tgz#4bc12c2ebe8aa277a71f1d3f14d685c7b446cd00"
  integrity sha512-i6dHe3EyLjMmDlU1/bGQpEw25XSjkJULPuAVKCbNRefQVq48yXKUpwg538F7AZTf9kyr57zj++pQFltUa5H7yA==
  dependencies:
    chokidar "^2.0.2"
    graceful-fs "^4.1.2"
    neo-async "^2.5.0"

wbuf@^1.1.0, wbuf@^1.7.3:
  version "1.7.3"
  resolved "https://registry.yarnpkg.com/wbuf/-/wbuf-1.7.3.tgz#c1d8d149316d3ea852848895cb6a0bfe887b87df"
  integrity sha512-O84QOnr0icsbFGLS0O3bI5FswxzRr8/gHwWkDlQFskhSPryQXvrTMxjxGP4+iWYoauLoBvfDpkrOauZ+0iZpDA==
  dependencies:
    minimalistic-assert "^1.0.0"

webidl-conversions@^4.0.2:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/webidl-conversions/-/webidl-conversions-4.0.2.tgz#a855980b1f0b6b359ba1d5d9fb39ae941faa63ad"
  integrity sha512-YQ+BmxuTgd6UXZW3+ICGfyqRyHXVlD5GtQr5+qjiNW7bF0cqrzX500HVXPBOvgXb5YnzDd+h0zqyv61KUD7+Sg==

webpack-dev-middleware@^3.7.2:
  version "3.7.2"
  resolved "https://registry.yarnpkg.com/webpack-dev-middleware/-/webpack-dev-middleware-3.7.2.tgz#0019c3db716e3fa5cecbf64f2ab88a74bab331f3"
  integrity sha512-1xC42LxbYoqLNAhV6YzTYacicgMZQTqRd27Sim9wn5hJrX3I5nxYy1SxSd4+gjUFsz1dQFj+yEe6zEVmSkeJjw==
  dependencies:
    memory-fs "^0.4.1"
    mime "^2.4.4"
    mkdirp "^0.5.1"
    range-parser "^1.2.1"
    webpack-log "^2.0.0"

webpack-dev-server@3.10.3:
  version "3.10.3"
  resolved "https://registry.yarnpkg.com/webpack-dev-server/-/webpack-dev-server-3.10.3.tgz#f35945036813e57ef582c2420ef7b470e14d3af0"
  integrity sha512-e4nWev8YzEVNdOMcNzNeCN947sWJNd43E5XvsJzbAL08kGc2frm1tQ32hTJslRS+H65LCb/AaUCYU7fjHCpDeQ==
  dependencies:
    ansi-html "0.0.7"
    bonjour "^3.5.0"
    chokidar "^2.1.8"
    compression "^1.7.4"
    connect-history-api-fallback "^1.6.0"
    debug "^4.1.1"
    del "^4.1.1"
    express "^4.17.1"
    html-entities "^1.2.1"
    http-proxy-middleware "0.19.1"
    import-local "^2.0.0"
    internal-ip "^4.3.0"
    ip "^1.1.5"
    is-absolute-url "^3.0.3"
    killable "^1.0.1"
    loglevel "^1.6.6"
    opn "^5.5.0"
    p-retry "^3.0.1"
    portfinder "^1.0.25"
    schema-utils "^1.0.0"
    selfsigned "^1.10.7"
    semver "^6.3.0"
    serve-index "^1.9.1"
    sockjs "0.3.19"
    sockjs-client "1.4.0"
    spdy "^4.0.1"
    strip-ansi "^3.0.1"
    supports-color "^6.1.0"
    url "^0.11.0"
    webpack-dev-middleware "^3.7.2"
    webpack-log "^2.0.0"
    ws "^6.2.1"
    yargs "12.0.5"

webpack-log@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/webpack-log/-/webpack-log-2.0.0.tgz#5b7928e0637593f119d32f6227c1e0ac31e1b47f"
  integrity sha512-cX8G2vR/85UYG59FgkoMamwHUIkSSlV3bBMRsbxVXVUk2j6NleCKjQ/WE9eYg9WY4w25O9w8wKP4rzNZFmUcUg==
  dependencies:
    ansi-colors "^3.0.0"
    uuid "^3.3.2"

webpack-manifest-plugin@2.2.0:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/webpack-manifest-plugin/-/webpack-manifest-plugin-2.2.0.tgz#19ca69b435b0baec7e29fbe90fb4015de2de4f16"
  integrity sha512-9S6YyKKKh/Oz/eryM1RyLVDVmy3NSPV0JXMRhZ18fJsq+AwGxUY34X54VNwkzYcEmEkDwNxuEOboCZEebJXBAQ==
  dependencies:
    fs-extra "^7.0.0"
    lodash ">=3.5 <5"
    object.entries "^1.1.0"
    tapable "^1.0.0"

webpack-sources@^1.1.0, webpack-sources@^1.4.0, webpack-sources@^1.4.1, webpack-sources@^1.4.3:
  version "1.4.3"
  resolved "https://registry.yarnpkg.com/webpack-sources/-/webpack-sources-1.4.3.tgz#eedd8ec0b928fbf1cbfe994e22d2d890f330a933"
  integrity sha512-lgTS3Xhv1lCOKo7SA5TjKXMjpSM4sBjNV5+q2bqesbSPs5FjGmU6jjtBSkX9b4qW87vDIsCIlUPOEhbZrMdjeQ==
  dependencies:
    source-list-map "^2.0.0"
    source-map "~0.6.1"

webpack@4.42.0:
  version "4.42.0"
  resolved "https://registry.yarnpkg.com/webpack/-/webpack-4.42.0.tgz#b901635dd6179391d90740a63c93f76f39883eb8"
  integrity sha512-EzJRHvwQyBiYrYqhyjW9AqM90dE4+s1/XtCfn7uWg6cS72zH+2VPFAlsnW0+W0cDi0XRjNKUMoJtpSi50+Ph6w==
  dependencies:
    "@webassemblyjs/ast" "1.8.5"
    "@webassemblyjs/helper-module-context" "1.8.5"
    "@webassemblyjs/wasm-edit" "1.8.5"
    "@webassemblyjs/wasm-parser" "1.8.5"
    acorn "^6.2.1"
    ajv "^6.10.2"
    ajv-keywords "^3.4.1"
    chrome-trace-event "^1.0.2"
    enhanced-resolve "^4.1.0"
    eslint-scope "^4.0.3"
    json-parse-better-errors "^1.0.2"
    loader-runner "^2.4.0"
    loader-utils "^1.2.3"
    memory-fs "^0.4.1"
    micromatch "^3.1.10"
    mkdirp "^0.5.1"
    neo-async "^2.6.1"
    node-libs-browser "^2.2.1"
    schema-utils "^1.0.0"
    tapable "^1.1.3"
    terser-webpack-plugin "^1.4.3"
    watchpack "^1.6.0"
    webpack-sources "^1.4.1"

websocket-driver@>=0.5.1:
  version "0.7.3"
  resolved "https://registry.yarnpkg.com/websocket-driver/-/websocket-driver-0.7.3.tgz#a2d4e0d4f4f116f1e6297eba58b05d430100e9f9"
  integrity sha512-bpxWlvbbB459Mlipc5GBzzZwhoZgGEZLuqPaR0INBGnPAY1vdBX6hPnoFXiw+3yWxDuHyQjO2oXTMyS8A5haFg==
  dependencies:
    http-parser-js ">=0.4.0 <0.4.11"
    safe-buffer ">=5.1.0"
    websocket-extensions ">=0.1.1"

websocket-extensions@>=0.1.1:
  version "0.1.3"
  resolved "https://registry.yarnpkg.com/websocket-extensions/-/websocket-extensions-0.1.3.tgz#5d2ff22977003ec687a4b87073dfbbac146ccf29"
  integrity sha512-nqHUnMXmBzT0w570r2JpJxfiSD1IzoI+HGVdd3aZ0yNi3ngvQ4jv1dtHt5VGxfI2yj5yqImPhOK4vmIh2xMbGg==

whatwg-encoding@^1.0.1, whatwg-encoding@^1.0.3, whatwg-encoding@^1.0.5:
  version "1.0.5"
  resolved "https://registry.yarnpkg.com/whatwg-encoding/-/whatwg-encoding-1.0.5.tgz#5abacf777c32166a51d085d6b4f3e7d27113ddb0"
  integrity sha512-b5lim54JOPN9HtzvK9HFXvBma/rnfFeqsic0hSpjtDbVxR3dJKLc+KB4V6GgiGOvl7CY/KNh8rxSo9DKQrnUEw==
  dependencies:
    iconv-lite "0.4.24"

whatwg-fetch@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/whatwg-fetch/-/whatwg-fetch-3.0.0.tgz#fc804e458cc460009b1a2b966bc8817d2578aefb"
  integrity sha512-9GSJUgz1D4MfyKU7KRqwOjXCXTqWdFNvEr7eUBYchQiVc744mqK/MzXPNR2WsPkmkOa4ywfg8C2n8h+13Bey1Q==

whatwg-mimetype@^2.1.0, whatwg-mimetype@^2.2.0, whatwg-mimetype@^2.3.0:
  version "2.3.0"
  resolved "https://registry.yarnpkg.com/whatwg-mimetype/-/whatwg-mimetype-2.3.0.tgz#3d4b1e0312d2079879f826aff18dbeeca5960fbf"
  integrity sha512-M4yMwr6mAnQz76TbJm914+gPpB/nCwvZbJU28cUD6dR004SAxDLOOSUaB1JDRqLtaOV/vi0IC5lEAGFgrjGv/g==

whatwg-url@^6.4.1:
  version "6.5.0"
  resolved "https://registry.yarnpkg.com/whatwg-url/-/whatwg-url-6.5.0.tgz#f2df02bff176fd65070df74ad5ccbb5a199965a8"
  integrity sha512-rhRZRqx/TLJQWUpQ6bmrt2UV4f0HCQ463yQuONJqC6fO2VoEb1pTYddbe59SkYq87aoM5A3bdhMZiUiVws+fzQ==
  dependencies:
    lodash.sortby "^4.7.0"
    tr46 "^1.0.1"
    webidl-conversions "^4.0.2"

whatwg-url@^7.0.0:
  version "7.1.0"
  resolved "https://registry.yarnpkg.com/whatwg-url/-/whatwg-url-7.1.0.tgz#c2c492f1eca612988efd3d2266be1b9fc6170d06"
  integrity sha512-WUu7Rg1DroM7oQvGWfOiAK21n74Gg+T4elXEQYkOhtyLeWiJFoOGLXPKI/9gzIie9CtwVLm8wtw6YJdKyxSjeg==
  dependencies:
    lodash.sortby "^4.7.0"
    tr46 "^1.0.1"
    webidl-conversions "^4.0.2"

which-module@^2.0.0:
  version "2.0.0"
  resolved "https://registry.yarnpkg.com/which-module/-/which-module-2.0.0.tgz#d9ef07dce77b9902b8a3a8fa4b31c3e3f7e6e87a"
  integrity sha1-2e8H3Od7mQK4o6j6SzHD4/fm6Ho=

which@^1.2.9, which@^1.3.0, which@^1.3.1:
  version "1.3.1"
  resolved "https://registry.yarnpkg.com/which/-/which-1.3.1.tgz#a45043d54f5805316da8d62f9f50918d3da70b0a"
  integrity sha512-HxJdYWq1MTIQbJ3nw0cqssHoTNU267KlrDuGZ1WYlxDStUtKUhOaJmh112/TZmHxxUfuJqPXSOm7tDyas0OSIQ==
  dependencies:
    isexe "^2.0.0"

which@^2.0.1:
  version "2.0.2"
  resolved "https://registry.yarnpkg.com/which/-/which-2.0.2.tgz#7c6a8dd0a636a0327e10b59c9286eee93f3f51b1"
  integrity sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==
  dependencies:
    isexe "^2.0.0"

word-wrap@~1.2.3:
  version "1.2.3"
  resolved "https://registry.yarnpkg.com/word-wrap/-/word-wrap-1.2.3.tgz#610636f6b1f703891bd34771ccb17fb93b47079c"
  integrity sha512-Hz/mrNwitNRh/HUAtM/VT/5VH+ygD6DV7mYKZAtHOrbs8U7lvPS6xf7EJKMF0uW1KJCl0H701g3ZGus+muE5vQ==

workbox-background-sync@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-background-sync/-/workbox-background-sync-4.3.1.tgz#26821b9bf16e9e37fd1d640289edddc08afd1950"
  integrity sha512-1uFkvU8JXi7L7fCHVBEEnc3asPpiAL33kO495UMcD5+arew9IbKW2rV5lpzhoWcm/qhGB89YfO4PmB/0hQwPRg==
  dependencies:
    workbox-core "^4.3.1"

workbox-broadcast-update@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-broadcast-update/-/workbox-broadcast-update-4.3.1.tgz#e2c0280b149e3a504983b757606ad041f332c35b"
  integrity sha512-MTSfgzIljpKLTBPROo4IpKjESD86pPFlZwlvVG32Kb70hW+aob4Jxpblud8EhNb1/L5m43DUM4q7C+W6eQMMbA==
  dependencies:
    workbox-core "^4.3.1"

workbox-build@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-build/-/workbox-build-4.3.1.tgz#414f70fb4d6de47f6538608b80ec52412d233e64"
  integrity sha512-UHdwrN3FrDvicM3AqJS/J07X0KXj67R8Cg0waq1MKEOqzo89ap6zh6LmaLnRAjpB+bDIz+7OlPye9iii9KBnxw==
  dependencies:
    "@babel/runtime" "^7.3.4"
    "@hapi/joi" "^15.0.0"
    common-tags "^1.8.0"
    fs-extra "^4.0.2"
    glob "^7.1.3"
    lodash.template "^4.4.0"
    pretty-bytes "^5.1.0"
    stringify-object "^3.3.0"
    strip-comments "^1.0.2"
    workbox-background-sync "^4.3.1"
    workbox-broadcast-update "^4.3.1"
    workbox-cacheable-response "^4.3.1"
    workbox-core "^4.3.1"
    workbox-expiration "^4.3.1"
    workbox-google-analytics "^4.3.1"
    workbox-navigation-preload "^4.3.1"
    workbox-precaching "^4.3.1"
    workbox-range-requests "^4.3.1"
    workbox-routing "^4.3.1"
    workbox-strategies "^4.3.1"
    workbox-streams "^4.3.1"
    workbox-sw "^4.3.1"
    workbox-window "^4.3.1"

workbox-cacheable-response@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-cacheable-response/-/workbox-cacheable-response-4.3.1.tgz#f53e079179c095a3f19e5313b284975c91428c91"
  integrity sha512-Rp5qlzm6z8IOvnQNkCdO9qrDgDpoPNguovs0H8C+wswLuPgSzSp9p2afb5maUt9R1uTIwOXrVQMmPfPypv+npw==
  dependencies:
    workbox-core "^4.3.1"

workbox-core@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-core/-/workbox-core-4.3.1.tgz#005d2c6a06a171437afd6ca2904a5727ecd73be6"
  integrity sha512-I3C9jlLmMKPxAC1t0ExCq+QoAMd0vAAHULEgRZ7kieCdUd919n53WC0AfvokHNwqRhGn+tIIj7vcb5duCjs2Kg==

workbox-expiration@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-expiration/-/workbox-expiration-4.3.1.tgz#d790433562029e56837f341d7f553c4a78ebe921"
  integrity sha512-vsJLhgQsQouv9m0rpbXubT5jw0jMQdjpkum0uT+d9tTwhXcEZks7qLfQ9dGSaufTD2eimxbUOJfWLbNQpIDMPw==
  dependencies:
    workbox-core "^4.3.1"

workbox-google-analytics@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-google-analytics/-/workbox-google-analytics-4.3.1.tgz#9eda0183b103890b5c256e6f4ea15a1f1548519a"
  integrity sha512-xzCjAoKuOb55CBSwQrbyWBKqp35yg1vw9ohIlU2wTy06ZrYfJ8rKochb1MSGlnoBfXGWss3UPzxR5QL5guIFdg==
  dependencies:
    workbox-background-sync "^4.3.1"
    workbox-core "^4.3.1"
    workbox-routing "^4.3.1"
    workbox-strategies "^4.3.1"

workbox-navigation-preload@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-navigation-preload/-/workbox-navigation-preload-4.3.1.tgz#29c8e4db5843803b34cd96dc155f9ebd9afa453d"
  integrity sha512-K076n3oFHYp16/C+F8CwrRqD25GitA6Rkd6+qAmLmMv1QHPI2jfDwYqrytOfKfYq42bYtW8Pr21ejZX7GvALOw==
  dependencies:
    workbox-core "^4.3.1"

workbox-precaching@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-precaching/-/workbox-precaching-4.3.1.tgz#9fc45ed122d94bbe1f0ea9584ff5940960771cba"
  integrity sha512-piSg/2csPoIi/vPpp48t1q5JLYjMkmg5gsXBQkh/QYapCdVwwmKlU9mHdmy52KsDGIjVaqEUMFvEzn2LRaigqQ==
  dependencies:
    workbox-core "^4.3.1"

workbox-range-requests@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-range-requests/-/workbox-range-requests-4.3.1.tgz#f8a470188922145cbf0c09a9a2d5e35645244e74"
  integrity sha512-S+HhL9+iTFypJZ/yQSl/x2Bf5pWnbXdd3j57xnb0V60FW1LVn9LRZkPtneODklzYuFZv7qK6riZ5BNyc0R0jZA==
  dependencies:
    workbox-core "^4.3.1"

workbox-routing@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-routing/-/workbox-routing-4.3.1.tgz#a675841af623e0bb0c67ce4ed8e724ac0bed0cda"
  integrity sha512-FkbtrODA4Imsi0p7TW9u9MXuQ5P4pVs1sWHK4dJMMChVROsbEltuE79fBoIk/BCztvOJ7yUpErMKa4z3uQLX+g==
  dependencies:
    workbox-core "^4.3.1"

workbox-strategies@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-strategies/-/workbox-strategies-4.3.1.tgz#d2be03c4ef214c115e1ab29c9c759c9fe3e9e646"
  integrity sha512-F/+E57BmVG8dX6dCCopBlkDvvhg/zj6VDs0PigYwSN23L8hseSRwljrceU2WzTvk/+BSYICsWmRq5qHS2UYzhw==
  dependencies:
    workbox-core "^4.3.1"

workbox-streams@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-streams/-/workbox-streams-4.3.1.tgz#0b57da70e982572de09c8742dd0cb40a6b7c2cc3"
  integrity sha512-4Kisis1f/y0ihf4l3u/+ndMkJkIT4/6UOacU3A4BwZSAC9pQ9vSvJpIi/WFGQRH/uPXvuVjF5c2RfIPQFSS2uA==
  dependencies:
    workbox-core "^4.3.1"

workbox-sw@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-sw/-/workbox-sw-4.3.1.tgz#df69e395c479ef4d14499372bcd84c0f5e246164"
  integrity sha512-0jXdusCL2uC5gM3yYFT6QMBzKfBr2XTk0g5TPAV4y8IZDyVNDyj1a8uSXy3/XrvkVTmQvLN4O5k3JawGReXr9w==

workbox-webpack-plugin@4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-webpack-plugin/-/workbox-webpack-plugin-4.3.1.tgz#47ff5ea1cc074b6c40fb5a86108863a24120d4bd"
  integrity sha512-gJ9jd8Mb8wHLbRz9ZvGN57IAmknOipD3W4XNE/Lk/4lqs5Htw4WOQgakQy/o/4CoXQlMCYldaqUg+EJ35l9MEQ==
  dependencies:
    "@babel/runtime" "^7.0.0"
    json-stable-stringify "^1.0.1"
    workbox-build "^4.3.1"

workbox-window@^4.3.1:
  version "4.3.1"
  resolved "https://registry.yarnpkg.com/workbox-window/-/workbox-window-4.3.1.tgz#ee6051bf10f06afa5483c9b8dfa0531994ede0f3"
  integrity sha512-C5gWKh6I58w3GeSc0wp2Ne+rqVw8qwcmZnQGpjiek8A2wpbxSJb1FdCoQVO+jDJs35bFgo/WETgl1fqgsxN0Hg==
  dependencies:
    workbox-core "^4.3.1"

worker-farm@^1.7.0:
  version "1.7.0"
  resolved "https://registry.yarnpkg.com/worker-farm/-/worker-farm-1.7.0.tgz#26a94c5391bbca926152002f69b84a4bf772e5a8"
  integrity sha512-rvw3QTZc8lAxyVrqcSGVm5yP/IJ2UcB3U0graE3LCFoZ0Yn2x4EoVSqJKdB/T5M+FLcRPjz4TDacRf3OCfNUzw==
  dependencies:
    errno "~0.1.7"

worker-rpc@^0.1.0:
  version "0.1.1"
  resolved "https://registry.yarnpkg.com/worker-rpc/-/worker-rpc-0.1.1.tgz#cb565bd6d7071a8f16660686051e969ad32f54d5"
  integrity sha512-P1WjMrUB3qgJNI9jfmpZ/htmBEjFh//6l/5y8SD9hg1Ef5zTTVVoRjTrTEzPrNBQvmhMxkoTsjOXN10GWU7aCg==
  dependencies:
    microevent.ts "~0.1.1"

wrap-ansi@^2.0.0:
  version "2.1.0"
  resolved "https://registry.yarnpkg.com/wrap-ansi/-/wrap-ansi-2.1.0.tgz#d8fc3d284dd05794fe84973caecdd1cf824fdd85"
  integrity sha1-2Pw9KE3QV5T+hJc8rs3Rz4JP3YU=
  dependencies:
    string-width "^1.0.1"
    strip-ansi "^3.0.1"

wrap-ansi@^5.1.0:
  version "5.1.0"
  resolved "https://registry.yarnpkg.com/wrap-ansi/-/wrap-ansi-5.1.0.tgz#1fd1f67235d5b6d0fee781056001bfb694c03b09"
  integrity sha512-QC1/iN/2/RPVJ5jYK8BGttj5z83LmSKmvbvrXPNCLZSEb32KKVDJDl/MOt2N01qU2H/FkzEa9PKto1BqDjtd7Q==
  dependencies:
    ansi-styles "^3.2.0"
    string-width "^3.0.0"
    strip-ansi "^5.0.0"

wrappy@1:
  version "1.0.2"
  resolved "https://registry.yarnpkg.com/wrappy/-/wrappy-1.0.2.tgz#b5243d8f3ec1aa35f1364605bc0d1036e30ab69f"
  integrity sha1-tSQ9jz7BqjXxNkYFvA0QNuMKtp8=

write-file-atomic@2.4.1:
  version "2.4.1"
  resolved "https://registry.yarnpkg.com/write-file-atomic/-/write-file-atomic-2.4.1.tgz#d0b05463c188ae804396fd5ab2a370062af87529"
  integrity sha512-TGHFeZEZMnv+gBFRfjAcxL5bPHrsGKtnb4qsFAws7/vlh+QfwAaySIw4AXP9ZskTTh5GWu3FLuJhsWVdiJPGvg==
  dependencies:
    graceful-fs "^4.1.11"
    imurmurhash "^0.1.4"
    signal-exit "^3.0.2"

write@1.0.3:
  version "1.0.3"
  resolved "https://registry.yarnpkg.com/write/-/write-1.0.3.tgz#0800e14523b923a387e415123c865616aae0f5c3"
  integrity sha512-/lg70HAjtkUgWPVZhZcm+T4hkL8Zbtp1nFNOn3lRrxnlv50SRBv7cR7RqR+GMsd3hUXy9hWBo4CHTbFTcOYwig==
  dependencies:
    mkdirp "^0.5.1"

ws@^5.2.0:
  version "5.2.2"
  resolved "https://registry.yarnpkg.com/ws/-/ws-5.2.2.tgz#dffef14866b8e8dc9133582514d1befaf96e980f"
  integrity sha512-jaHFD6PFv6UgoIVda6qZllptQsMlDEJkTQcybzzXDYM1XO9Y8em691FGMPmM46WGyLU4z9KMgQN+qrux/nhlHA==
  dependencies:
    async-limiter "~1.0.0"

ws@^6.1.2, ws@^6.2.1:
  version "6.2.1"
  resolved "https://registry.yarnpkg.com/ws/-/ws-6.2.1.tgz#442fdf0a47ed64f59b6a5d8ff130f4748ed524fb"
  integrity sha512-GIyAXC2cB7LjvpgMt9EKS2ldqr0MTrORaleiOno6TweZ6r3TKtoFQWay/2PceJ3RuBasOHzXNn5Lrw1X0bEjqA==
  dependencies:
    async-limiter "~1.0.0"

xml-name-validator@^3.0.0:
  version "3.0.0"
  resolved "https://registry.yarnpkg.com/xml-name-validator/-/xml-name-validator-3.0.0.tgz#6ae73e06de4d8c6e47f9fb181f78d648ad457c6a"
  integrity sha512-A5CUptxDsvxKJEU3yO6DuWBSJz/qizqzJKOMIfUJHETbBw/sFaDxgd6fxm1ewUaM0jZ444Fc5vC5ROYurg/4Pw==

xmlchars@^2.1.1:
  version "2.2.0"
  resolved "https://registry.yarnpkg.com/xmlchars/-/xmlchars-2.2.0.tgz#060fe1bcb7f9c76fe2a17db86a9bc3ab894210cb"
  integrity sha512-JZnDKK8B0RCDw84FNdDAIpZK+JuJw+s7Lz8nksI7SIuU3UXJJslUthsi+uWBUYOwPFwW7W7PRLRfUKpxjtjFCw==

xregexp@^4.3.0:
  version "4.3.0"
  resolved "https://registry.yarnpkg.com/xregexp/-/xregexp-4.3.0.tgz#7e92e73d9174a99a59743f67a4ce879a04b5ae50"
  integrity sha512-7jXDIFXh5yJ/orPn4SXjuVrWWoi4Cr8jfV1eHv9CixKSbU+jY4mxfrBwAuDvupPNKpMUY+FeIqsVw/JLT9+B8g==
  dependencies:
    "@babel/runtime-corejs3" "^7.8.3"

xtend@^4.0.0, xtend@~4.0.1:
  version "4.0.2"
  resolved "https://registry.yarnpkg.com/xtend/-/xtend-4.0.2.tgz#bb72779f5fa465186b1f438f674fa347fdb5db54"
  integrity sha512-LKYU1iAXJXUgAXn9URjiu+MWhyUXHsvfp7mcuYm9dSUKK0/CjtrUwFAxD82/mCWbtLsGjFIad0wIsod4zrTAEQ==

"y18n@^3.2.1 || ^4.0.0", y18n@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/y18n/-/y18n-4.0.0.tgz#95ef94f85ecc81d007c264e190a120f0a3c8566b"
  integrity sha512-r9S/ZyXu/Xu9q1tYlpsLIsa3EeLXXk0VwlxqTcFRfg9EhMW+17kbt9G0NrgCmhGb5vT2hyhJZLfDGx+7+5Uj/w==

yallist@^3.0.2:
  version "3.1.1"
  resolved "https://registry.yarnpkg.com/yallist/-/yallist-3.1.1.tgz#dbb7daf9bfd8bac9ab45ebf602b8cbad0d5d08fd"
  integrity sha512-a4UGQaWPH59mOXUYnAG2ewncQS4i4F43Tv3JoAM+s2VDAmS9NsK8GpDMLrCHPksFT7h3K6TOoUNn2pb7RoXx4g==

yallist@^4.0.0:
  version "4.0.0"
  resolved "https://registry.yarnpkg.com/yallist/-/yallist-4.0.0.tgz#9bb92790d9c0effec63be73519e11a35019a3a72"
  integrity sha512-3wdGidZyq5PB084XLES5TpOSRA3wjXAlIWMhum2kRcv/41Sn2emQ0dycQW4uZXLejwKvg6EsvbdlVL+FYEct7A==

yaml@^1.7.2:
  version "1.8.2"
  resolved "https://registry.yarnpkg.com/yaml/-/yaml-1.8.2.tgz#a29c03f578faafd57dcb27055f9a5d569cb0c3d9"
  integrity sha512-omakb0d7FjMo3R1D2EbTKVIk6dAVLRxFXdLZMEUToeAvuqgG/YuHMuQOZ5fgk+vQ8cx+cnGKwyg+8g8PNT0xQg==
  dependencies:
    "@babel/runtime" "^7.8.7"

yargs-parser@^11.1.1:
  version "11.1.1"
  resolved "https://registry.yarnpkg.com/yargs-parser/-/yargs-parser-11.1.1.tgz#879a0865973bca9f6bab5cbdf3b1c67ec7d3bcf4"
  integrity sha512-C6kB/WJDiaxONLJQnF8ccx9SEeoTTLek8RVbaOIsrAUS8VrBEXfmeSnCZxygc+XC2sNMBIwOOnfcxiynjHsVSQ==
  dependencies:
    camelcase "^5.0.0"
    decamelize "^1.2.0"

yargs-parser@^13.1.2:
  version "13.1.2"
  resolved "https://registry.yarnpkg.com/yargs-parser/-/yargs-parser-13.1.2.tgz#130f09702ebaeef2650d54ce6e3e5706f7a4fb38"
  integrity sha512-3lbsNRf/j+A4QuSZfDRA7HRSfWrzO0YjqTJd5kjAq37Zep1CEgaYmrH9Q3GwPiB9cHyd1Y1UwggGhJGoxipbzg==
  dependencies:
    camelcase "^5.0.0"
    decamelize "^1.2.0"

yargs@12.0.5:
  version "12.0.5"
  resolved "https://registry.yarnpkg.com/yargs/-/yargs-12.0.5.tgz#05f5997b609647b64f66b81e3b4b10a368e7ad13"
  integrity sha512-Lhz8TLaYnxq/2ObqHDql8dX8CJi97oHxrjUcYtzKbbykPtVW9WB+poxI+NM2UIzsMgNCZTIf0AQwsjK5yMAqZw==
  dependencies:
    cliui "^4.0.0"
    decamelize "^1.2.0"
    find-up "^3.0.0"
    get-caller-file "^1.0.1"
    os-locale "^3.0.0"
    require-directory "^2.1.1"
    require-main-filename "^1.0.1"
    set-blocking "^2.0.0"
    string-width "^2.0.0"
    which-module "^2.0.0"
    y18n "^3.2.1 || ^4.0.0"
    yargs-parser "^11.1.1"

yargs@^13.3.0:
  version "13.3.2"
  resolved "https://registry.yarnpkg.com/yargs/-/yargs-13.3.2.tgz#ad7ffefec1aa59565ac915f82dccb38a9c31a2dd"
  integrity sha512-AX3Zw5iPruN5ie6xGRIDgqkT+ZhnRlZMLMHAs8tg7nRruy2Nb+i5o9bwghAogtM08q1dpr2LVoS8KSTMYpWXUw==
  dependencies:
    cliui "^5.0.0"
    find-up "^3.0.0"
    get-caller-file "^2.0.1"
    require-directory "^2.1.1"
    require-main-filename "^2.0.0"
    set-blocking "^2.0.0"
    string-width "^3.0.0"
    which-module "^2.0.0"
    y18n "^4.0.0"
    yargs-parser "^13.1.2"
*/