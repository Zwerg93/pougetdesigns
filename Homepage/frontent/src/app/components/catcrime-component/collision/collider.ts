export class Collider {

    /* I changed this so all the checks happen in y first order. */
    collide(value: number, object: any, tile_x: number, tile_y: number, tile_size: number) {

        switch (value) {

            case  1:
                this.collidePlatformTop(object, tile_y);
                break;
            case  2:
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case  3:
                if (this.collidePlatformTop(object, tile_y)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case  4:
                this.collidePlatformBottom(object, tile_y + tile_size);
                break;
            case  5:
                if (this.collidePlatformTop(object, tile_y)) return;
                this.collidePlatformBottom(object, tile_y + tile_size);
                break;
            case  6:
                if (this.collidePlatformRight(object, tile_x + tile_size)) return;
                this.collidePlatformBottom(object, tile_y + tile_size);
                break;
            case  7:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case  8:
                this.collidePlatformLeft(object, tile_x);
                break;
            case  9:
                if (this.collidePlatformTop(object, tile_y)) return;
                this.collidePlatformLeft(object, tile_x);
                break;
            case 10:
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case 11:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case 12:
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                this.collidePlatformLeft(object, tile_x);
                break;
            case 13:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                this.collidePlatformLeft(object, tile_x);
                break;
            case 14:
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;
            case 15:
                if (this.collidePlatformTop(object, tile_y)) return;
                if (this.collidePlatformBottom(object, tile_y + tile_size)) return;
                if (this.collidePlatformLeft(object, tile_x)) return;
                this.collidePlatformRight(object, tile_x + tile_size);
                break;

        }

    }

    collidePlatformBottom(object: any, tile_bottom: number) {

        if (object.getTop() < tile_bottom && object.getOldTop() >= tile_bottom) {

            object.setTop(tile_bottom);
            object.velocity_y = 0;
            return true;

        }
        return false;

    }

    collidePlatformLeft(object: any, tile_left: number) {

        if (object.getRight() > tile_left && object.getOldRight() <= tile_left) {

            object.setRight(tile_left - 0.01);
            object.velocity_x = 0;
            return true;

        }
        return false;

    }

    collidePlatformRight(object: any, tile_right: number) {

        if (object.getLeft() < tile_right && object.getOldLeft() >= tile_right) {

            object.setLeft(tile_right);
            object.velocity_x = 0;
            return true;

        }
        return false;

    }

    collidePlatformTop(object: any, tile_top: number) {

        if (object.getBottom() > tile_top && object.getOldBottom() <= tile_top) {

            object.setBottom(tile_top - 0.01);
            object.velocity_y = 0;
            object.jumping = false;
            return true;

        }
        return false;

    }

}