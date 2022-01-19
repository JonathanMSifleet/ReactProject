import { ReactNode } from 'react';
import Footer from '../../hoc/PageView/Footer/Footer';
import Header from '../../hoc/PageView/Header/Header';
import classes from './PageView.module.scss';

interface IProps {
  children?: ReactNode;
}

const PageView: React.FC<IProps> = ({ children }): JSX.Element => {
  return (
    <div className={classes.PageViewContainer}>
      <Header />
      <div className={classes.Body}> {children} </div>
      <Footer />
    </div>
  );
};

export default PageView;