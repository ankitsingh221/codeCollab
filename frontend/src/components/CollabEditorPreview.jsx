import { GitBranch, Cpu, Shield, MessageSquare } from "lucide-react";

const CollabEditorPreview = () => {
  // Design tokens matching the Landing page
  const raised = {
    background: "linear-gradient(160deg, #F7F8FA 0%, #E5E7EB 100%)",
    boxShadow:
      "7px 7px 16px rgba(163,167,178,0.45), -7px -7px 16px rgba(255,255,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6)",
    border: "1px solid rgba(255,255,255,0.5)",
  };

  const pressed = {
    background: "linear-gradient(160deg, #E3E5E9 0%, #F0F1F4 100%)",
    boxShadow:
      "inset 3px 3px 7px rgba(163,167,178,0.5), inset -3px -3px 7px rgba(255,255,255,0.9)",
  };

  const raisedSm = {
    background: "linear-gradient(160deg, #F7F8FA 0%, #E7E9EC 100%)",
    boxShadow:
      "4px 4px 10px rgba(163,167,178,0.4), -4px -4px 10px rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.5)",
  };

  return (
    <div className="relative">
      {/* Outer container with raised effect */}
      <div
        className="p-4 rounded-[20px] transition-all duration-300 hover:scale-[1.01]"
        style={raised}
      >
        {/* Inner editor container with pressed effect */}
        <div className="rounded-xl overflow-hidden" style={pressed}>
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#C8CDD4] bg-gradient-to-b from-[#F0F1F4] to-[#E5E7EB]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div
                  className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, #ff5f56, #e0443e)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.2)",
                  }}
                />
                <div
                  className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, #ffbd2e, #dea123)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.2)",
                  }}
                />
                <div
                  className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-110"
                  style={{
                    background:
                      "radial-gradient(circle at 35% 35%, #27c93f, #1aab29)",
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.2)",
                  }}
                />
              </div>
              <span className="text-xs font-mono text-[#5A4A3A] font-medium tracking-wide">
                server.js
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-[#5A4A3A] font-medium">
                <span 
                  className="w-1.5 h-1.5 rounded-full animate-pulse" 
                  style={{ 
                    background: "#6B9E6B",
                    boxShadow: "0 0 8px rgba(107,158,107,0.3)"
                  }}
                />
                <span>3 collaborators</span>
              </div>
              <GitBranch 
                size={14} 
                className="text-[#5A4A3A]" 
              />
            </div>
          </div>

          {/* Code Content */}
          <div className="p-5 font-mono text-sm bg-gradient-to-b from-[#F0F1F4] to-[#E5E7EB]">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-end select-none text-xs leading-6 text-[#787B85] font-medium">
                {Array.from({ length: 18 }, (_, i) => i + 1).map((n) => (
                  <span
                    key={n}
                    className="h-6 transition-all duration-300 hover:text-[#2B2B2F] hover:scale-110"
                  >
                    {n}
                  </span>
                ))}
              </div>

              <div className="flex-1 space-y-0.5 leading-6 text-[#2B2B2F]">
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>const</span>{" "}
                  <span style={{ color: "#2C5F8B" }}>express</span> ={" "}
                  <span style={{ color: "#2C5F8B" }}>require</span>(
                  <span style={{ color: "#6B9E6B" }}>'express'</span>);
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>const</span>{" "}
                  <span style={{ color: "#2C5F8B" }}>http</span> ={" "}
                  <span style={{ color: "#2C5F8B" }}>require</span>(
                  <span style={{ color: "#6B9E6B" }}>'http'</span>);
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>const</span>{" "}
                  <span style={{ color: "#2C5F8B" }}>socketIO</span> ={" "}
                  <span style={{ color: "#2C5F8B" }}>require</span>(
                  <span style={{ color: "#6B9E6B" }}>'socket.io'</span>);
                </div>
                <div className="h-3"></div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>const</span>{" "}
                  <span style={{ color: "#2C5F8B" }}>app</span> ={" "}
                  <span style={{ color: "#2C5F8B" }}>express</span>();
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>const</span>{" "}
                  <span style={{ color: "#2C5F8B" }}>server</span> ={" "}
                  <span style={{ color: "#2C5F8B" }}>http</span>.
                  <span style={{ color: "#2C5F8B" }}>createServer</span>
                  (app);
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>const</span>{" "}
                  <span style={{ color: "#2C5F8B" }}>io</span> ={" "}
                  <span style={{ color: "#2C5F8B" }}>socketIO</span>
                  (server, {"{"});
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"  "}
                  <span style={{ color: "#6B9E6B" }}>cors</span>: {"{"}
                  <span style={{ color: "#6B9E6B" }}>origin</span>:{" "}
                  <span style={{ color: "#6B9E6B" }}>"*"</span>
                  {"}"}
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"}"});
                </div>
                <div className="h-3"></div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>io</span>
                  .<span style={{ color: "#2C5F8B" }}>on</span>(
                  <span style={{ color: "#6B9E6B" }}>'connection'</span>,
                  (<span style={{ color: "#2C5F8B" }}>socket</span>) =&gt; {"{"}
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"  "}
                  <span style={{ color: "#2C5F8B" }}>console</span>.
                  <span style={{ color: "#2C5F8B" }}>log</span>(
                  <span style={{ color: "#6B9E6B" }}>'User connected'</span>
                  );
                </div>
                <div className="h-3"></div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"  "}
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>socket</span>
                  .<span style={{ color: "#2C5F8B" }}>on</span>(
                  <span style={{ color: "#6B9E6B" }}>'code-change'</span>,
                  (<span style={{ color: "#2C5F8B" }}>data</span>) =&gt; {"{"}
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"    "}
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>socket</span>
                  .<span style={{ color: "#2C5F8B" }}>broadcast</span>.
                  <span style={{ color: "#2C5F8B" }}>emit</span>(
                  <span style={{ color: "#6B9E6B" }}>'receive-code'</span>, data);
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"  }"});
                </div>
                <div className="h-3"></div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"  "}
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>socket</span>
                  .<span style={{ color: "#2C5F8B" }}>on</span>(
                  <span style={{ color: "#6B9E6B" }}>'cursor-update'</span>,
                  (<span style={{ color: "#2C5F8B" }}>cursorData</span>) =&gt; {"{"}
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"    "}
                  <span style={{ color: "#C1652F", fontWeight: "bold" }}>socket</span>
                  .<span style={{ color: "#2C5F8B" }}>broadcast</span>.
                  <span style={{ color: "#2C5F8B" }}>emit</span>(
                  <span style={{ color: "#6B9E6B" }}>'cursor-move'</span>, cursorData);
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"  }"});
                </div>
                <div className="transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  {"}"});
                </div>

                <div className="flex items-center gap-1.5 mt-1 transition-all duration-300 hover:bg-[#D5D9E0]/50 hover:pl-1 rounded">
                  <div 
                    className="w-0.5 h-5 animate-pulse" 
                    style={{ 
                      background: "#C1652F",
                      boxShadow: "0 0 12px rgba(193,101,47,0.2)"
                    }}
                  />
                  <span className="text-xs font-medium" style={{ color: "#C1652F" }}>
                    Ankit is typing...
                  </span>
                  <div className="flex gap-0.5 ml-1">
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-bounce" 
                      style={{ 
                        background: "#C1652F",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                      }}
                    />
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-bounce delay-100" 
                      style={{ 
                        background: "#D07B47",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                      }}
                    />
                    <div 
                      className="w-1.5 h-1.5 rounded-full animate-bounce delay-200" 
                      style={{ 
                        background: "#C1652F",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-[#C8CDD4] bg-gradient-to-b from-[#E5E7EB] to-[#D5D9E0]">
            <div className="flex items-center gap-4 text-xs font-mono text-[#787B85] font-medium">
              <span className="flex items-center gap-1.5 transition-all duration-300 hover:text-[#2B2B2F] hover:scale-105 cursor-pointer">
                <Cpu
                  size={12}
                  className="transition-all duration-300 hover:rotate-180"
                  style={{ color: "#C1652F" }}
                />
                <span>Ln 16, Col 25</span>
              </span>
              <span className="transition-all duration-300 hover:text-[#2B2B2F] cursor-pointer">
                UTF-8
              </span>
              <span className="transition-all duration-300 hover:text-[#2B2B2F] cursor-pointer">
                JavaScript
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#787B85] font-medium">
              <span className="flex items-center gap-1.5 transition-all duration-300 hover:text-[#2B2B2F] hover:scale-105 cursor-pointer">
                <Shield
                  size={12}
                  className="transition-all duration-300 hover:rotate-12"
                  style={{ color: "#C1652F" }}
                />
                <span>Live sync</span>
              </span>
              <span className="flex items-center gap-1.5 transition-all duration-300 hover:text-[#2B2B2F] hover:scale-105 cursor-pointer">
                <MessageSquare
                  size={12}
                  className="transition-all duration-300 hover:rotate-12"
                  style={{ color: "#C1652F" }}
                />
                <span>5 messages</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollabEditorPreview;