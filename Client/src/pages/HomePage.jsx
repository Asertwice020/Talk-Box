// import Logout from "../elements/Logout"
import ChatPanel from '../elements/ChatPanel';
import Sidebar from '../elements/Sidebar'
// import ChatPanel from '../elements/ChatPanel'

const HomePage = () => {
  return (
    <div className="bg-[#0C1317] flex text-white h-screen p-5 relative justify-between gap-1">
      <Sidebar />
      <ChatPanel />
    </div>
  );
}

export default HomePage