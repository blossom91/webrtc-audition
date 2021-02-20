import React, {useRef, useEffect} from 'react';
import CodeMirror from 'codemirror/lib/codemirror.js';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/jsx/jsx';
import 'codemirror/mode/vue/vue';
import 'codemirror/theme/dracula.css';
import './index.less';
import pc from '../../server/rtc';

const Code = () => {
    const editor = useRef('');
    useEffect(() => {
        editor.current = CodeMirror.fromTextArea(document.getElementById('code'), {
            indentUnit: 4,
            lineNumbers: true,
            theme: 'dracula',
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            matchBrackets: true,
        });

        let now_code = '';

        const onCode = (data) => {
            now_code = data;
            editor.current.setValue(data);
        };
        pc.on('code', onCode);
        editor.current.on('change', function (cMirror) {
            let value = cMirror.getValue();
            if (value !== now_code) {
                pc.sendMsg(value, 'code');
            }
        });

        return () => {
            pc.removeListener('code', onCode);
        };
    }, []);
    return (
        <div className="box-code">
            <textarea id="code" name="code"></textarea>
        </div>
    );
};

export default Code;
