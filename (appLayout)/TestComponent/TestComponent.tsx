import './TestComponent.css';

export const TestComponent  = () => {
    // TODO test class name as a prop
    //const quickClass = classNames('ptr-quickStyle', 'ptr-quickParagraph');

    return (
        <div className="ptr-TestComponent">
            <h1>I am just a test component</h1>
            <p className="ptr-TestComponent-paragraph">Please, ignore my view</p>
            <p className="ptr-TestComponent-colors">
                Accent color from fe-core color scale
            </p>
        </div>
    );
};
// <div className={`${styles.quickStyle}`}>
