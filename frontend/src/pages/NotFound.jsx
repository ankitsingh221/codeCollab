import { Link } from "react-router-dom";
import { Compass, Home, ArrowLeft } from "lucide-react";

const raised = {
  background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
  boxShadow:
    "7px 7px 16px rgba(163,167,178,0.45), -7px -7px 16px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6)",
  border: "1px solid rgba(255,255,255,0.5)",
};

const raisedSm = {
  background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
  boxShadow:
    "4px 4px 10px rgba(163,167,178,0.4), -4px -4px 10px rgba(255,255,255,0.85)",
  border: "1px solid rgba(255,255,255,0.5)",
};

const NotFound = () => (
  <div
    className="min-h-screen flex items-center justify-center px-4"
    style={{ background: "#ECEDF0" }}
  >
    <div
      className="rounded-[24px] max-w-md w-full p-10 text-center"
      style={raised}
    >
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={raisedSm}>
        <Compass className="w-10 h-10" style={{ color: "#C1652F" }} />
      </div>
      <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ color: "#26262B" }}>
        404
      </h1>
      <p className="text-base font-medium mb-1" style={{ color: "#4A4C53" }}>
        Page not found
      </p>
      <p className="text-sm mb-8" style={{ color: "#787B85" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/dashboard">
          <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95"
            style={{
              background: "linear-gradient(160deg, #D07B47, #B0552A)",
              boxShadow:
                "6px 6px 14px rgba(163,167,178,0.5), -3px -3px 10px rgba(255,255,255,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
              color: "#FBF6F1",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </button>
        </Link>
        <Link to="/">
          <button
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] active:scale-95"
            style={{ ...raisedSm, color: "#787B85" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </button>
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
