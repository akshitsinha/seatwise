"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Seat, SeatsResponse } from "@/pages/api/seats";

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
  stands: string[];
  onStandSelect: (stand: string) => void;
}

const StandSelector: React.FC<StandSelectorProps> = ({
  stands,
  onStandSelect,
}) => {
  return (
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
};

interface LevelSelectorProps {
  levels: string[];
  stand: string;
  onLevelSelect: (level: string) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({
  levels,
  onLevelSelect,
}) => {
  return (
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
};

interface SeatButtonProps {
  seat?: Seat;
  onClick: (id: string) => void;
}

const SeatButton: React.FC<SeatButtonProps> = ({ seat, onClick }) => (
  <button
    onClick={() => seat && onClick(seat.sid)}
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
    {seat ? seat.sid.split("-")[1].slice(-1) : ""}
  </button>
);

interface SeatSelectorProps {
  seats: Seat[];
  rows: string[];
  columns: number[];
  onSeatToggle: (id: string) => void;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
  seats,
  rows,
  columns,
  onSeatToggle,
}) => {
  return (
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
            {columns.slice(1).map((column) => {
            const seat = seats.find((s) => s.sid.endsWith(`${row}${column}`));
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
};

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

const LoadingScreen: React.FC = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f0f0f0",
    }}
  >
    <div
      style={{
        textAlign: "center",
        fontSize: "24px",
        fontWeight: "bold",
        color: "#3498db",
      }}
    >
      <div className="spinner" style={{ marginBottom: "20px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "4px solid #3498db",
            borderTop: "4px solid #f0f0f0",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
      </div>
      Loading...
    </div>
    <style jsx>{`
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `}</style>
  </div>
);

export default function Component() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [selectedStand, setSelectedStand] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [view, setView] = useState<"stands" | "levels" | "seats" | "summary">(
    "stands"
  );
  const [stands, setStands] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [rows, setRows] = useState<string[]>([]);
  const [columns, setColumns] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookingDetails, setBookingDetails] = useState<{
    ticketId: number;
    seats: Seat[];
    amount: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/seats")
      .then((res) => res.json())
      .then((res: SeatsResponse) => {
        if (!res || !res.success || !res.data) return;
        setSeats(res.data.seats);
        setStands(res.data.stands);
        setLevels(res.data.levels);
        setRows(res.data.rows);
        setColumns([...Array(res.data.columns).keys()]);
        const selected = res.data.seats.filter(
          (seat: Seat) => seat.status === "selected"
        );
        setSelectedSeats(selected);
        setTotalPrice(selected.reduce((sum, seat) => sum + seat.price, 0));
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingScreen />;
  if (!seats) return <p>Failed to load seats</p>;

  const toggleSeat = (id: string) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.sid === id && seat.status !== "unavailable"
          ? {
              ...seat,
              status: seat.status === "available" ? "selected" : "available",
            }
          : seat
      )
    );

    updateSelectedSeatsAndPrice();
  };

  const updateSelectedSeatsAndPrice = () => {
    const selected = seats.filter((seat) => seat.status === "selected");
    setSelectedSeats(selected);
    setTotalPrice(selected.reduce((sum, seat) => sum + seat.price, 0));
  };

  const resetSelection = () => {
    setLoading(true);
    fetch("/api/seats")
      .then((res) => res.json())
      .then((res: SeatsResponse) => {
        if (!res || !res.success || !res.data) return;
        setSeats(res.data.seats);
        setStands(res.data.stands);
        setLevels(res.data.levels);
        setRows(res.data.rows);
        setColumns([...Array(res.data.columns).keys()]);
        setSelectedSeats([]);
        setTotalPrice(0);
        setSelectedStand(null);
        setSelectedLevel(null);
        setView("stands");
        setBookingDetails(null);
        setLoading(false);
      });
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
    updateSelectedSeatsAndPrice();
    setView("summary");
  };

  const handleBook = async () => {
    const seatIds = selectedSeats.map((seat) => seat.sid);
    const response = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ seatIds }),
    });
    const result = await response.json();
    if (result.success) {
      setBookingDetails(result.data);
    } else {
      alert("Failed to book seats: " + result.error);
    }
  };

  return (
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
        Stadium Seat Selector
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
          <StandSelector stands={stands} onStandSelect={handleStandSelect} />
        )}
        {view === "levels" && selectedStand && (
          <LevelSelector
            levels={levels}
            stand={selectedStand}
            onLevelSelect={handleLevelSelect}
          />
        )}
        {view === "seats" && selectedStand && selectedLevel && (
          <SeatSelector
            seats={seats.filter((seat) =>
              seat.sid.startsWith(`${selectedStand}${selectedLevel}`)
            )}
            rows={rows}
            columns={columns}
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
                {selectedSeats.map((seat) => seat.sid).join(", ") || "None"}
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
              <ActionButton
                disabled={selectedSeats.length === 0}
                onClick={handleBook}
              >
                Book
              </ActionButton>
            </>
          )}
        </div>
        {bookingDetails && (
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              marginTop: "20px",
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
              Booking Details
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <span>Ticket ID:</span>
              <span>{bookingDetails.ticketId}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <span>Booked Seats:</span>
              <span>{bookingDetails.seats.map((seat) => seat.sid).join(", ")}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              <span>Total Amount:</span>
              <span>₹{bookingDetails.amount}</span>
            </div>
          </div>
        )}
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
        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
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
  );
}
