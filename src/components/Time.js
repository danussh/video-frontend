import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import MaterialTable from "material-table";
import XLSX from "xlsx";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

const Time = () => {
  const [table, setTable] = useState([]);
  const columns = [
    { title: "Name", field: "firstName" },
    { title: "Email", field: "email" },
    { title: "Time", field: "time", type: "numeric" },
  ];

  useEffect(() => {
    axios
      .get("https://videocall-zoomish.herokuapp.com/timelogs")
      .then((res) => {
        setTable(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const downloadExcel = () => {
    const newData = table.map((row) => {
      delete row.tableData;
      return row;
    });
    const workSheet = XLSX.utils.json_to_sheet(newData);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "TimeSheet");
    //Buffer
    let buf = XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });
    //Binary string
    XLSX.write(workBook, { bookType: "xlsx", type: "binary" });
    //Download
    XLSX.writeFile(workBook, "TimeLogs.xlsx");
  };

  return (
    <>
      <Navbar />
      <h1 align="center">Take Leap</h1>
      <h4 align="center">Export Time Log Data to Excel </h4>
      <MaterialTable
        title="Time Logs of Login:"
        columns={columns}
        data={table}
        actions={[
          {
            icon: () => <AccountBalanceWalletIcon />,
            tooltip: "Export to Excel",
            onClick: () => downloadExcel(),
            isFreeAction: true,
          },
        ]}
      />
    </>
  );
};

export default Time;
