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
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import "./Dashboard.css";
import { useHistory } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import Tooltip from "@mui/material/Tooltip";

const useStyles = makeStyles((theme) => ({
  search: {
    position: "relative",
    borderRadius: 12,
    backgroundColor: "#d6d6d6",
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

const socket = io.connect("https://videocall-zoomish.herokuapp.com");
function Dashboard() {
  const classes = useStyles();
  const history = useHistory();
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
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

  window.addEventListener("popstate", () => {
    history.push("/dashboard");
    window.location.replace("/dashboard");
  });

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
      // console.log(data)
      setReceivingCall(true);
      setOpen(false);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    socket.emit("currentUser", userData._id);
  }, []);

  useEffect(() => {
    axios
      .get("https://videocall-zoomish.herokuapp.com/registers")
      .then((resp) => {
        // console.log(resp.data);
        const filter = resp.data.filter((val) => {
          return val.email !== userData.email;
        });
        setList(filter);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Call user from respective ID
  const callUser = (id) => {
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
      //  setOpen(false)
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  //call search user from searchBox
  const callSearchUser = (id) => {
    setOpen(true);
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
      setOpen(false);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    setOpen(false);
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
    window.location.reload();
  };

  const cancelCall = () => {
    setCallEnded(true);
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <div className="main">
        <div className="d-flex justify-content-around">
          <h3 className="header">
            Takeleap :
            <span style={{ color: "rgb(255 139 0)" }}>
              Welcome {userData.firstName}
            </span>
          </h3>
          <button className="btn btn-danger mt-1" onClick={logout}>
            Logout
          </button>
        </div>
        <div className="container mt-2">
          <div className="video-container d-flex justify-content-around">
            <div className="video">
              {stream && (
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  className="vid"
                  autoPlay
                  style={{ width: "400px" }}
                />
              )}
            </div>
            <div className="video">
              {callAccepted && !callEnded ? (
                <video
                  className="vid"
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
                              <Tooltip title="Call" placement="right-start">
                                <PhoneIcon
                                  className="phoneIcon"
                                  fontSize="small"
                                  onClick={() => callSearchUser(val._id)}
                                />
                              </Tooltip>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="myId mt-2">
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
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={leaveCall}
                >
                  End Call
                </Button>
              ) : (
                <Tooltip title="Call">
                  <IconButton
                    color="primary"
                    aria-label="call"
                    onClick={() => callUser(idToCall)}
                  >
                    <PhoneIcon fontSize="large" className="phoneIcon" />
                  </IconButton>
                </Tooltip>
              )}
              {idToCall ? "ID To Call:" : ""} {idToCall}
            </div>
          </div>
          <div>
            {receivingCall && !callAccepted ? (
              <div className="caller">
                <h1 className="caliing">
                  {name ? name : "UnKnown"} is calling...
                </h1>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={answerCall}
                >
                  Answer
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={cancelCall}
                >
                  Cancel Call
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={open}
        >
          <button className="btn btn-danger" onClick={cancelCall}>
            cancelCall
          </button>
        </Backdrop>
      </div>
    </>
  );
}

export default Dashboard;
