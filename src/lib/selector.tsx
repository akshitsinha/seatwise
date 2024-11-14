"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";

type SeatStatus = "available" | "selected" | "unavailable";
type Seat = {
  id: string;
  status: SeatStatus;
  price: number;
};

const stands = ["A", "B", "C", "D"];
const levels = ["1", "2", "3"];
const rows = ["A", "B", "C", "D", "E"];
const columns = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const generateSeats = (stand: string, level: string): Seat[] =>
  rows.flatMap((row) =>
    columns.map((column) => ({
      id: `${stand}${level}-${row}${column}`,
      status: Math.random() > 0.8 ? "unavailable" : "available",
      price: Math.floor(Math.random() * 1000) + 3000,
    }))
  );

const initialSeats = stands.flatMap((stand) =>
  levels.flatMap((level) => generateSeats(stand, level))
);

interface SelectorButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

const SelectorButton: React.FC<SelectorButtonProps> = ({
  onClick,
  children,
}) => (
  <button
    onClick={onClick}
    style={{
      padding: "12px 20px",
      border: "none",
      borderRadius: "25px",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#fff",
      backgroundColor: "#3498db",
      transition: "background-color 0.3s, transform 0.1s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2980b9")}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3498db")}
  >
    {children}
  </button>
);

interface StandSelectorProps {
  onStandSelect: (stand: string) => void;
}

const StandSelector: React.FC<StandSelectorProps> = ({ onStandSelect }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "center",
    }}
  >
    {stands.map((stand) => (
      <SelectorButton key={stand} onClick={() => onStandSelect(stand)}>
        Stand {stand}
      </SelectorButton>
    ))}
  </div>
);

interface LevelSelectorProps {
  stand: string;
  onLevelSelect: (level: string) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  stand,
  onLevelSelect,
}) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      justifyContent: "center",
    }}
  >
    {levels.map((level) => (
      <SelectorButton key={level} onClick={() => onLevelSelect(level)}>
        Level {level}
      </SelectorButton>
    ))}
  </div>
);

interface SeatButtonProps {
  seat: Seat | null;
  onClick: (id: string) => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({ seat, onClick }) => (
  <button
    onClick={() => seat && onClick(seat.id)}
    style={{
      width: "35px",
      height: "35px",
      margin: "2px",
      border: "none",
      borderRadius: "5px",
      fontSize: "12px",
      fontWeight: "bold",
      cursor: seat && seat.status !== "unavailable" ? "pointer" : "not-allowed",
      backgroundColor: seat
        ? seat.status === "available"
          ? "#2ecc71"
          : seat.status === "selected"
          ? "#e74c3c"
          : "#95a5a6"
        : "#95a5a6",
      color: seat && seat.status !== "unavailable" ? "#fff" : "#7f8c8d",
      transition: "transform 0.1s",
    }}
    disabled={!seat || seat.status === "unavailable"}
  >
    {seat ? seat.id.split("-")[1].slice(-1) : ""}
  </button>
);

interface SeatSelectorProps {
  seats: Seat[];
  onSeatToggle: (id: string) => void;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({ seats, onSeatToggle }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "5px",
      alignItems: "center",
    }}
  >
    {rows.map((row) => (
      <div key={row} style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: "30px",
            textAlign: "center",
            fontWeight: "bold",
            marginRight: "10px",
          }}
        >
          {row}
        </div>
        {columns.map((column) => {
          const seat = seats.find((s) => s.id.endsWith(`${row}${column}`));
          return (
            <SeatButton
              key={`${row}${column}`}
              seat={seat}
              onClick={onSeatToggle}
            />
          );
        })}
      </div>
    ))}
  </div>
);

interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick = () => {},
  disabled = false,
  children,
}) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "10px 20px",
      border: "none",
      borderRadius: "5px",
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: "16px",
      fontWeight: "bold",
      color: "#fff",
      backgroundColor: disabled ? "#bdc3c7" : "#3498db",
      transition: "background-color 0.3s",
    }}
  >
    {children}
  </Button>
);

export default function Component() {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedStand, setSelectedStand] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [view, setView] = useState<"stands" | "levels" | "seats" | "summary">(
    "stands"
  );

  const toggleSeat = (id: string) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === id && seat.status !== "unavailable"
          ? {
              ...seat,
              status: seat.status === "available" ? "selected" : "available",
            }
          : seat
      )
    );
  };

  const selectedSeats = seats.filter((seat) => seat.status === "selected");
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const resetSelection = () => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.status === "selected" ? { ...seat, status: "available" } : seat
      )
    );
    setSelectedStand(null);
    setSelectedLevel(null);
    setView("stands");
  };

  const handleStandSelect = (stand: string) => {
    setSelectedStand(stand);
    setView("levels");
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(level);
    setView("seats");
  };

  const handleBack = () => {
    if (view === "seats") {
      setView("levels");
      setSelectedLevel(null);
    } else if (view === "levels") {
      setView("stands");
      setSelectedStand(null);
    } else if (view === "summary") {
      setView("seats");
    }
  };

  const handleComplete = () => {
    setView("summary");
  };

  return (
    <>
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: "20px",
            color: "#333",
          }}
        >
          Improved Stadium Seat Selector
        </h1>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "15px",
              color: "#2c3e50",
            }}
          >
            {view === "stands"
              ? "Select a Stand"
              : view === "levels"
              ? `Select a Level for Stand ${selectedStand}`
              : view === "seats"
              ? `Select Seats for Stand ${selectedStand}, Level ${selectedLevel}`
              : "Booking Summary"}
          </div>
          {view === "stands" && (
            <StandSelector onStandSelect={handleStandSelect} />
          )}
          {view === "levels" && selectedStand && (
            <LevelSelector
              stand={selectedStand}
              onLevelSelect={handleLevelSelect}
            />
          )}
          {view === "seats" && selectedStand && selectedLevel && (
            <SeatSelector
              seats={seats.filter((seat) =>
                seat.id.startsWith(`${selectedStand}${selectedLevel}`)
              )}
              onSeatToggle={toggleSeat}
            />
          )}
          {view === "summary" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  fontSize: "16px",
                }}
              >
                <span>Selected Seats:</span>
                <span>
                  {selectedSeats.map((seat) => seat.id).join(", ") || "None"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                  fontSize: "16px",
                }}
              >
                <span>Total Price:</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            {view !== "stands" && (
              <ActionButton onClick={handleBack}>Back</ActionButton>
            )}
            {view === "seats" && (
              <ActionButton onClick={handleComplete}>
                Complete Selection
              </ActionButton>
            )}
            {view === "summary" && (
              <>
                <ActionButton onClick={resetSelection}>
                  Reset Selection
                </ActionButton>
                <ActionButton disabled={selectedSeats.length === 0}>
                  Proceed to Checkout
                </ActionButton>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px",
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "15px",
              color: "#2c3e50",
            }}
          >
            Seat Status Legend
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  backgroundColor: "#2ecc71",
                }}
              ></div>
              <span>Available</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  backgroundColor: "#e74c3c",
                }}
              ></div>
              <span>Selected</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  backgroundColor: "#95a5a6",
                }}
              ></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
