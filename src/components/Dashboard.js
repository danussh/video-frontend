import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import AssignmentIcon from "@material-ui/icons/Assignment";
import PhoneIcon from "@material-ui/icons/Phone";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Peer from "simple-peer";
import io from "socket.io-client";
import InputBase from "@material-ui/core/InputBase";
import { alpha, makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import "./Dashboard.css";
import { useHistory } from "react-router-dom";
import Backdrop from '@mui/material/Backdrop';

const useStyles = makeStyles((theme) => ({
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
  },
  searchIcon: {
    // padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

const socket = io.connect("http://localhost:4040");
function Dashboard() {
  const classes = useStyles();
  const history = useHistory();
  const [list, setList] = useState([]);
  const [open,setOpen] = useState(false)
  const [me, setMe] = useState("");
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [search, setSearch] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const userData = JSON.parse(sessionStorage.getItem("accesToken"));
  //   console.log(userData)
  const logout = () => {
    sessionStorage.clear();
    history.push("/");
  };
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        myVideo.current.srcObject = stream;
      });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.on("callSearchUser", (data) => {
      setReceivingCall(true);
      setOpen(false)
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.emit("currentUser", userData._id);
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:4040/registers")
      .then((resp) => {
        console.log(resp.data);
        const filter = resp.data.filter((val) => {
          return val.email !== userData.email;
        });
        setList(filter);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const callUser = (id) => {
    setOpen(true)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };
  //call search user
  const callSearchUser = (id) => {
    setOpen(true)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("callSearchUser", {
        userToCall: id,
        myCall: userData._id,
        signalData: data,
        from: me,
        name: userData.firstName,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };
  //

  const answerCall = () => {
    setCallAccepted(true);
    setOpen(false)
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const cancelCall = () => {
    setCallEnded(true);
    setOpen(false)
    window.location.reload();
  };

  return (
    <>
      <div className="d-flex justify-content-around">
        <h3 className="header">
          Zoomish :{" "}
          <span style={{ color: "#444444" }}>Welcome {userData.firstName}</span>
        </h3>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="container">
        <div className="video-container d-flex justify-content-around">
          <div className="video">
            {stream && (
              <video
                playsInline
                muted
                ref={myVideo}
                autoPlay
                style={{ width: "400px" }}
              />
            )}
          </div>
          <div className="video">
            {callAccepted && !callEnded ? (
              <video
                playsInline
                ref={userVideo}
                autoPlay
                style={{ width: "400px" }}
              />
            ) : (
              <div className="search pl-2">
                <div className={classes.search}>
                  <div className={classes.searchIcon}>
                    <SearchIcon />
                  </div>
                  <InputBase
                    placeholder="Search…"
                    classes={{
                      root: classes.inputRoot,
                      input: classes.inputInput,
                    }}
                    inputProps={{ "aria-label": "search" }}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                    value={search}
                  />
                </div>
                <div className="searchList">
                  {list
                    .filter((val) => {
                      if (search === "") {
                        return val;
                      } else if (
                        val.firstName
                          .toLowerCase()
                          .includes(search.toLowerCase())
                      ) {
                        return val;
                      }
                    })
                    .map((val, key) => {
                      return (
                        <div className="block" key={key}>
                          <div className="searchname">{val.firstName}</div>
                          <div>
                            <PhoneIcon
                              className="phoneIcon"
                              fontSize="small"
                              onClick={() => callSearchUser(val._id)}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="myId">
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <div>
            <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssignmentIcon fontSize="large" />}
              >
                Copy ID
              </Button>
            </CopyToClipboard>
          </div>
          <TextField
            id="filled-basic"
            label="ID to call"
            variant="filled"
            value={idToCall}
            onChange={(e) => setIdToCall(e.target.value)}
          />
          <div className="call-button">
            {callAccepted && !callEnded ? (
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
            ) : (
              <IconButton
                color="primary"
                aria-label="call"
                onClick={() => callUser(idToCall)}
              >
                <PhoneIcon fontSize="large" />
              </IconButton>
            )}
            {idToCall ? "ID To Call:" : ""} {idToCall}
          </div>
        </div>
        <div>
          {receivingCall && !callAccepted ? (
            <div className="caller">
              <h1>{name ? name : "UnKnown"} is calling...</h1>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={cancelCall}
              >
                cancel Call
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <button className="btn btn-danger" onClick={cancelCall}>cancelCall</button>
      </Backdrop>
    </>
  );
}

export default Dashboard;
