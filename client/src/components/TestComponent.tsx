import React, { useState } from "react";

interface CalculatorState {
  num1: string;
  num2: string;
  operator: string;
  result: string;
}

const Test: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    num1: "",
    num2: "",
    operator: "",
    result: "",
  });

  const handleNumberClick = (num: string) => {
    if (state.operator === "") {
      setState({ ...state, num1: state.num1 + num });
    } else {
      setState({ ...state, num2: state.num2 + num });
    }
  };

  const handleOperatorClick = (operator: string) => {
    setState({ ...state, operator: operator });
  };

  const handleEqualsClick = () => {
    let result: number;
    switch (state.operator) {
      case "+":
        result = parseFloat(state.num1) + parseFloat(state.num2);
        break;
      case "-":
        result = parseFloat(state.num1) - parseFloat(state.num2);
        break;
      case "*":
        result = parseFloat(state.num1) * parseFloat(state.num2);
        break;
      case "/":
        result = parseFloat(state.num1) / parseFloat(state.num2);
        break;
      default:
        result = 0;
    }
    setState({
      ...state,
      result: result.toString(),
      num1: "",
      num2: "",
      operator: "",
    });
  };

  const handleClearClick = () => {
    setState({ num1: "", num2: "", operator: "", result: "" });
  };

  return (
    <div
      style={{
        width: "300px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <input
        type="text"
        value={state.num1 + state.operator + state.num2}
        style={{
          width: "100%",
          height: "40px",
          fontSize: "24px",
          padding: "10px",
          marginBottom: "20px",
          border: "none",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
        readOnly
      />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("7")}
        >
          7
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("8")}
        >
          8
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("9")}
        >
          9
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleOperatorClick("/")}
        >
          /
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("4")}
        >
          4
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("5")}
        >
          5
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("6")}
        >
          6
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleOperatorClick("*")}
        >
          *
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("1")}
        >
          1
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("2")}
        >
          2
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("3")}
        >
          3
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleOperatorClick("-")}
        >
          -
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleNumberClick("0")}
        >
          0
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleEqualsClick()}
        >
          =
        </button>
        <button
          style={{
            width: "60px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
          onClick={() => handleOperatorClick("+")}
        >
          +
        </button>
        <button
          style={{
            width: "120px",
            height: "40px",
            fontSize: "18px",
            padding: "10px",
            margin: "5px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#e74c3c",
            color: "#fff",
          }}
          onClick={() => handleClearClick()}
        >
          Clear
        </button>
      </div>
      <p style={{ fontSize: "24px", padding: "10px", marginBottom: "20px" }}>
        Result: {state.result}
      </p>
    </div>
  );
};

export default Test;
