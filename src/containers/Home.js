import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { ListGroup, ListGroupItem, Button, Col, Row, Container, Jumbotron, Badge} from "react-bootstrap";
import "./Home.css";
import { LinkContainer } from "react-router-bootstrap";
import { Auth, getUserById, deleteClassFromUser } from "../firebase";
import ClassModal from './Modal'
import courseData from "../data/4770/courses.json";

export default function Home(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState(props.name);
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(props.user);

  useEffect(() => {onLoad()}, [isLoading, user]);
  Auth.onAuthStateChanged(() => { 
    if (user !== Auth.currentUser) 
      setUser(Auth.currentUser);
  });

  async function onLoad() {
    if (!Auth.currentUser) { 
      setName(null);
      return; 
    }
    await getUserById(Auth.currentUser.email)
    .then(data => {
      setName(data.name);
      setClasses(data.classes);
    }).catch(err => alert(err));

    setIsLoading(false);
  }

  //pass user to /message
  var path = {
    pathname: '/message',
    query: name,
  }

  function searchClassAttribute(id){
    for(var i = 0; i < courseData.length; i++){
      if(courseData[i].id == id){
        var classAttribute = courseData[i].subject + " " + courseData[i].catalog_num;
        return classAttribute;
      }
    }
  }

  function handleClick(props){
    deleteClassFromUser(props, Auth.currentUser.email);
    setIsLoading(true);
  }

  function renderClassList() {
    return(
    <>
      <LinkContainer key="new" to="/search">
        <ListGroupItem>
            <b>{"\uFF0B"}</b> Add a new class
        </ListGroupItem>
      </LinkContainer>

      <ListGroup>
        {classes.map(clsId => renderClass(clsId))}
      </ListGroup>
    </>
    );
  }

  function renderClass(clsId){
    //pass the data?
    //props.history.push(path);
    return(
    <>
      <ListGroupItem key={clsId.toString()}>
        <Row>
          <Col md={4}>
            <ClassModal name={searchClassAttribute(clsId)} id={clsId} userId={Auth.currentUser.email}/>
          </Col>
          <Col md={{ span: 1, offset: 6 }}>
            <Button variant="outline-dark" onClick={()=>handleClick(clsId)}>Delete</Button>
          </Col>
        </Row>
      </ListGroupItem>
    </>
    );
  }

  function renderLander() {
    return (
      <Container className="lander">
        <h1>Metchup</h1>
        <p>A simple way to find study partner</p>
      </Container>
    );
  }

  function renderDashboard() {
    var message = <span><strong>Welcome, {name}.</strong></span>;
    return (
      <Container className="welcome">
        <Row>
          <Col md={10}>
            <h1>{message}</h1>
            <h4>Let's play around with your dashboard to find study groups.</h4>
          </Col>
        </Row>
        <ListGroup>
          {!isLoading && renderClassList()}
        </ListGroup>
      </Container>
    );
  }


  return (
    <Container className="Home">
      {Auth.currentUser ? renderDashboard() : renderLander()}
    </Container>
  );
}