import React, { useState, useEffect } from "react";
import { ListGroup, Button, Col, Row, Container } from "react-bootstrap";
import "./Home.css";
import { Auth, getUserById, deleteClassFromUser } from "../firebase";
import ClassModal from './Modal'
import courseData from "../data/4770/courses.json";

export default function Home(props) {
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState(props.userName);
  const [classes, setClasses] = useState([]);
  const [user, setUser] = useState(props.userObj);

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
      <ListGroup.Item href="/search" key="AddClass" className="AddClass">
        <b>{"\uFF0B"}</b> Add a new class
      </ListGroup.Item>

      {classes.map(clsId => renderClass(clsId))}
    </>
    );
  }

  function renderClass(clsId){
    // 下面的ClassModal也需要一个key
    return(
    <>
      <ListGroup.Item key={clsId.toString()}>
        <Row>
          <Col md={4}>
            <ClassModal key={clsId.toString()} name={searchClassAttribute(clsId)} id={clsId} userId={Auth.currentUser.email}/>
          </Col>
          <Col md={{ span: 2, offset: 6 }}>
            <Button variant="outline-dark" onClick={()=>handleClick(clsId)}>Delete</Button>
          </Col>
        </Row>
      </ListGroup.Item>
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
    var message = <span><strong>Welcome Back, {name}.</strong></span>;
    return (
      <Container className="Welcome">
        <Row>
          <Col md={10}>
            <h1>{message}</h1>
            <h4>Play around with your dashboard to find study groups.</h4>
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
