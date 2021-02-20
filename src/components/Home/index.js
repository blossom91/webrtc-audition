import React, {useEffect} from 'react';
import './index.less';
import Code from '../Code';
import Media from '../Media';
import Chat from '../Chat';
import pc from '../../server/rtc';
const App = () => {
    useEffect(() => {
        return () => {
            pc.destory();
        };
    }, []);
    return (
        <div className="home">
            <div className="left">
                <Code />
            </div>
            <div className="right">
                <Media />
                <Chat />
            </div>
        </div>
    );
};

export default App;
