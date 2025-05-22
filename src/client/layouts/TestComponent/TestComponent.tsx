import './TestComponent.css';

export const TestComponent = () => {
	// TODO test class name as a prop
	//const quickClass = classNames('ptr-quickStyle', 'ptr-quickParagraph');

	return (
		<div>
			<h1 className="ptr-TestComponent">I am just a test component</h1>
			<p>Please, ignore my view</p>
			<p>Accent color from fe-core color scale</p>
		</div>
	);
};
// <div className={`${styles.quickStyle}`}>
