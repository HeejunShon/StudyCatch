import InfiniteGrid, {GridLayout} from "@egjs/infinitegrid";
import defaultMember, * as card from '../';

// var InfiniteGrid = eg.InfiniteGrid;
// var GridLayout = InfiniteGrid.GridLayout;

var ig = new InfiniteGrid("#grid", {
    horizontal: false,
});

// initialize layout
// GridLayout, JustifiedLayout, FrameLayout, SquareLayout, PackingLayout
// * eg-gridlaytout 라이브러리 사용법 참조 *
//https://naver.github.io/egjs-infinitegrid/release/latest/doc/eg.InfiniteGrid.GridLayout.html

ig.setLayout(GridLayout, {
    itemSize: 322,
    align: "start",
    margin: 40
});

var lectures = new Array();

// var lecture = "<div class='item' style='display: flex; width: 20em; border: 1px solid; align-items: center; text-align: center;'><div class='profile' style='width:30%; align-items: center;'><div>얼굴</div><div><h3>이름</h3></div></div><div class='lecture' style='width:70%'><h1>Python</h1><h2>description</h2></div></div>";

var lecture = card();

lectures.push(lecture);
// lectures.push(lecture);

ig.append(lectures);


ig.layout(true);
