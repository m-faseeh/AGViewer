/*
 * Copyright 2025 SKAI Worldwide Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { connect } from 'react-redux';
import Frames from '../presentations/Frames';
import { addFrame } from '../../../features/frame/FrameSlice';

const mapStateToProps = (state) => ({
  frameList: state.frames,
  queryResult: state.cypher.queryResult,
  database: state.database,
  maxNumOfFrames: state.setting.maxNumOfFrames,
});

const mapDispatchToProps = { addFrame };

export default connect(mapStateToProps, mapDispatchToProps)(Frames);
