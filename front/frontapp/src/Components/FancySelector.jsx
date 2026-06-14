import { useRef, useEffect,useState } from 'react';
import './FancySelector.css';

export default function FancySelector({value , onChange}) {
    return (
    <div>
    <label id='labelselect'>
        Select a Model:
     </label>
          <select

                id='model'

                name='model_select'

                value={value}

                onChange={(e) => onChange(e.target.value)}

            >
            <option value = "CNN_LSTM">CNN-LSTM</option>
            <option value = "R2CNN_TRPN">R2CNN-TRPN</option>
        </select>
   
    </div>
    );
}